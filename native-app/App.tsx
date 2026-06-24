import { useEffect, useMemo, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Linking,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import { StatusBar } from "expo-status-bar"
import Slider from "@react-native-community/slider"
import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Audio, type AVPlaybackStatus } from "expo-av"
import { NavigationContainer, DefaultTheme } from "@react-navigation/native"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

type Song = {
  id: string
  title: string
  artist: string
  cover: string
  duration: number
  album: string
  url?: string
}

type FontSize = "small" | "normal" | "large"
type ColorScheme = "white" | "blue" | "lavender" | "green"
type Language = "zh" | "en"

type UserProfile = {
  name: string
  avatar: string
  isVip: boolean
}

type AppSettings = {
  fontSize: FontSize
  colorScheme: ColorScheme
  language: Language
  timerMinutes: number
}

type SearchQuota = {
  count: number
  date: string
}

type RootStackParamList = {
  Tabs: undefined
  Favorites: undefined
  Settings: undefined
  SettingsGeneral: undefined
  SettingsExperimental: undefined
  SettingsLanguage: undefined
  SettingsAbout: undefined
}

type TabParamList = {
  Search: undefined
  Home: undefined
  Profile: undefined
}

const RootStack = createNativeStackNavigator<RootStackParamList>()
const Tab = createBottomTabNavigator<TabParamList>()

const FONT_SCALE: Record<FontSize, number> = {
  small: 0.94,
  normal: 1,
  large: 1.08,
}

const PALETTES: Record<
  ColorScheme,
  {
    page: string
    card: string
    cardStrong: string
    text: string
    textMuted: string
    textFaint: string
    border: string
    accent: string
    accentSoft: string
    overlay: string
  }
> = {
  white: {
    page: "#f7f7f8",
    card: "#ffffff",
    cardStrong: "#eef0f2",
    text: "#111111",
    textMuted: "#53565c",
    textFaint: "#8b9097",
    border: "#e6e8eb",
    accent: "#111111",
    accentSoft: "#dcdfe3",
    overlay: "rgba(17,17,17,0.42)",
  },
  blue: {
    page: "#eef6ff",
    card: "#ffffff",
    cardStrong: "#dfefff",
    text: "#102033",
    textMuted: "#49627e",
    textFaint: "#7c93ad",
    border: "#d6e7fb",
    accent: "#2b6cb0",
    accentSoft: "#bfdcff",
    overlay: "rgba(16,32,51,0.45)",
  },
  lavender: {
    page: "#f6f0ff",
    card: "#ffffff",
    cardStrong: "#ece1ff",
    text: "#211633",
    textMuted: "#5d4f76",
    textFaint: "#8a7fa1",
    border: "#e4d7fb",
    accent: "#7c3aed",
    accentSoft: "#d8c5ff",
    overlay: "rgba(33,22,51,0.45)",
  },
  green: {
    page: "#edf9f3",
    card: "#ffffff",
    cardStrong: "#daf1e3",
    text: "#10241a",
    textMuted: "#4d6f5c",
    textFaint: "#7d9b8a",
    border: "#d7ecdf",
    accent: "#1f8a52",
    accentSoft: "#bee8cc",
    overlay: "rgba(16,36,26,0.42)",
  },
}

const DEFAULT_SONG: Song = {
  id: "__default__",
  title: "请先搜索并添加歌曲",
  artist: "Wave Music",
  cover: "https://picsum.photos/seed/default-wave/600/600",
  duration: 0,
  album: "Wave Music",
}

const MOCK_SONGS: Song[] = [
  {
    id: "1",
    title: "起风了",
    artist: "买辣椒也用券",
    cover: "https://picsum.photos/seed/song1/400/400",
    duration: 320,
    album: "起风了",
  },
  {
    id: "2",
    title: "孤勇者",
    artist: "陈奕迅",
    cover: "https://picsum.photos/seed/song2/400/400",
    duration: 285,
    album: "孤勇者",
  },
  {
    id: "3",
    title: "漠河舞厅",
    artist: "柳爽",
    cover: "https://picsum.photos/seed/song3/400/400",
    duration: 300,
    album: "漠河舞厅",
  },
  {
    id: "4",
    title: "等你下课",
    artist: "周杰伦",
    cover: "https://picsum.photos/seed/song4/400/400",
    duration: 278,
    album: "等你下课",
  },
  {
    id: "5",
    title: "光年之外",
    artist: "邓紫棋",
    cover: "https://picsum.photos/seed/song5/400/400",
    duration: 270,
    album: "光年之外",
  },
  {
    id: "6",
    title: "倒数",
    artist: "邓紫棋",
    cover: "https://picsum.photos/seed/song6/400/400",
    duration: 245,
    album: "倒数",
  },
  {
    id: "7",
    title: "夜曲",
    artist: "周杰伦",
    cover: "https://picsum.photos/seed/song7/400/400",
    duration: 315,
    album: "十一月的萧邦",
  },
  {
    id: "8",
    title: "后来",
    artist: "刘若英",
    cover: "https://picsum.photos/seed/song8/400/400",
    duration: 290,
    album: "后来",
  },
]

const SETTINGS_ITEMS = [
  { route: "SettingsGeneral" as const, label: "通用设置", desc: "字体大小、App 配色" },
  { route: "SettingsExperimental" as const, label: "实验功能", desc: "定时关闭" },
  { route: "SettingsLanguage" as const, label: "语言设置", desc: "切换 App 语言" },
  { route: "SettingsAbout" as const, label: "关于我们", desc: "版本信息、官网" },
]

const FONT_OPTIONS: { value: FontSize; label: string }[] = [
  { value: "small", label: "小" },
  { value: "normal", label: "标准" },
  { value: "large", label: "大" },
]

const COLOR_OPTIONS: { value: ColorScheme; label: string; color: string }[] = [
  { value: "white", label: "白", color: "#ffffff" },
  { value: "blue", label: "淡蓝", color: "#d8ebff" },
  { value: "lavender", label: "薰衣草", color: "#eadbff" },
  { value: "green", label: "浅绿", color: "#d8f3e2" },
]

const TIMER_OPTIONS = [
  { value: 0, label: "关闭" },
  { value: 15, label: "15 分钟" },
  { value: 30, label: "30 分钟" },
  { value: 45, label: "45 分钟" },
  { value: 60, label: "60 分钟" },
]

const LANG_OPTIONS: { value: Language; label: string }[] = [
  { value: "zh", label: "中文" },
  { value: "en", label: "English" },
]

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

function normalizeQuota(quota: SearchQuota): SearchQuota {
  const today = todayKey()
  if (quota.date === today) return quota
  return { count: 0, date: today }
}

function formatTime(seconds: number) {
  const safe = Math.max(0, Math.floor(seconds || 0))
  const minute = Math.floor(safe / 60)
  const second = safe % 60
  return `${minute}:${String(second).padStart(2, "0")}`
}

async function searchSongs(keyword: string): Promise<Song[]> {
  const query = keyword.trim()
  if (!query) return []

  try {
    const res = await fetch(
      `https://meting.mikus.ink/api?server=netease&type=search&id=${encodeURIComponent(query)}`,
    )
    if (!res.ok) return []

    const data: Array<{ id: string; title: string; author: string; pic: string; url: string }> =
      await res.json()

    return data.map((item) => ({
      id: item.id,
      title: item.title,
      artist: item.author,
      cover: item.pic.replace(/^http:/, "https:"),
      duration: 240,
      album: item.title,
      url: item.url,
    }))
  } catch {
    return MOCK_SONGS.filter(
      (song) =>
        song.title.includes(query) ||
        song.artist.includes(query) ||
        song.album.includes(query),
    )
  }
}

type UserState = {
  profile: UserProfile
  favorites: Song[]
  recentPlays: Song[]
  quota: SearchQuota
  settings: AppSettings
  updateName: (name: string) => void
  updateSettings: (settings: Partial<AppSettings>) => void
  toggleFavorite: (song: Song) => void
  isFavorite: (songId: string) => boolean
  addRecentPlay: (song: Song) => void
  canSearch: () => boolean
  consumeSearch: () => boolean
  getRemainingSearches: () => number
  getDailyLimit: () => number
}

const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      profile: {
        name: "音乐爱好者",
        avatar: "",
        isVip: false,
      },
      favorites: [],
      recentPlays: [],
      quota: { count: 0, date: todayKey() },
      settings: {
        fontSize: "normal",
        colorScheme: "white",
        language: "zh",
        timerMinutes: 0,
      },
      updateName: (name) =>
        set((state) => ({
          profile: { ...state.profile, name },
        })),
      updateSettings: (settings) =>
        set((state) => ({
          settings: { ...state.settings, ...settings },
        })),
      toggleFavorite: (song) =>
        set((state) => {
          const exists = state.favorites.some((item) => item.id === song.id)
          return {
            favorites: exists
              ? state.favorites.filter((item) => item.id !== song.id)
              : [song, ...state.favorites],
          }
        }),
      isFavorite: (songId) => get().favorites.some((item) => item.id === songId),
      addRecentPlay: (song) =>
        set((state) => {
          const next = [song, ...state.recentPlays.filter((item) => item.id !== song.id)].slice(0, 20)
          return { recentPlays: next }
        }),
      canSearch: () => {
        const quota = normalizeQuota(get().quota)
        if (quota.date !== get().quota.date || quota.count !== get().quota.count) {
          set({ quota })
        }
        return quota.count < get().getDailyLimit()
      },
      consumeSearch: () => {
        const quota = normalizeQuota(get().quota)
        const limit = get().getDailyLimit()
        if (quota.count >= limit) {
          if (quota.date !== get().quota.date || quota.count !== get().quota.count) set({ quota })
          return false
        }
        const nextQuota = { ...quota, count: quota.count + 1 }
        set({ quota: nextQuota })
        return true
      },
      getRemainingSearches: () => {
        const quota = normalizeQuota(get().quota)
        if (quota.date !== get().quota.date || quota.count !== get().quota.count) {
          set({ quota })
        }
        return Math.max(0, get().getDailyLimit() - quota.count)
      },
      getDailyLimit: () => (get().profile.isVip ? 100 : 12),
    }),
    {
      name: "wave-native-user-store",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
)

type SearchState = {
  query: string
  history: string[]
  results: Song[]
  loading: boolean
  setQuery: (query: string) => void
  search: (query: string) => Promise<void>
  removeHistory: (keyword: string) => void
  clearHistory: () => void
}

const useSearchStore = create<SearchState>()(
  persist(
    (set, get) => ({
      query: "",
      history: [],
      results: [],
      loading: false,
      setQuery: (query) => set({ query }),
      search: async (query) => {
        const trimmed = query.trim()
        if (!trimmed) {
          set({ results: [], loading: false, query: "" })
          return
        }

        set({ loading: true, query: trimmed })
        const results = await searchSongs(trimmed)
        const nextHistory = [trimmed, ...get().history.filter((item) => item !== trimmed)].slice(0, 10)
        set({ results, history: nextHistory, loading: false })
      },
      removeHistory: (keyword) =>
        set((state) => ({
          history: state.history.filter((item) => item !== keyword),
        })),
      clearHistory: () => set({ history: [] }),
    }),
    {
      name: "wave-native-search-store",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ history: state.history }),
    },
  ),
)

let playerSound: Audio.Sound | null = null

type PlayerState = {
  currentSong: Song | null
  playlist: Song[]
  isPlaying: boolean
  progress: number
  duration: number
  syncStatus: (status: { isPlaying: boolean; progress: number; duration: number }) => void
  play: (song?: Song) => Promise<void>
  pause: () => Promise<void>
  togglePlay: () => Promise<void>
  next: () => Promise<void>
  prev: () => Promise<void>
  seek: (progress: number) => Promise<void>
  removeFromPlaylist: (songId: string) => Promise<void>
  clearPlaylist: () => Promise<void>
  resumeFromPlaylist: () => Promise<void>
}

async function unloadSound() {
  if (!playerSound) return
  try {
    await playerSound.unloadAsync()
  } catch {
    // ignore audio cleanup errors
  }
  playerSound = null
}

function toProgress(positionMillis: number, durationMillis: number) {
  if (!durationMillis) return 0
  return Math.min(100, Math.max(0, (positionMillis / durationMillis) * 100))
}

async function loadAndPlaySong(song: Song) {
  await unloadSound()
  if (!song.url) return

  const { sound } = await Audio.Sound.createAsync(
    { uri: song.url },
    { shouldPlay: true, progressUpdateIntervalMillis: 500 },
    (status: AVPlaybackStatus) => {
      if (!status.isLoaded) {
        if ("error" in status && status.error) {
          usePlayerStore.getState().syncStatus({ isPlaying: false, progress: 0, duration: song.duration })
        }
        return
      }

      const duration = status.durationMillis ? Math.floor(status.durationMillis / 1000) : song.duration
      const progress = toProgress(status.positionMillis ?? 0, status.durationMillis ?? 0)

      usePlayerStore.getState().syncStatus({
        isPlaying: status.isPlaying,
        progress,
        duration,
      })

      if (status.didJustFinish) {
        void usePlayerStore.getState().next()
      }
    },
  )

  playerSound = sound
}

const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      currentSong: DEFAULT_SONG,
      playlist: [DEFAULT_SONG],
      isPlaying: false,
      progress: 0,
      duration: 0,
      syncStatus: (status) => set(status),
      play: async (song) => {
        const targetSong = song ?? get().currentSong ?? get().playlist[0] ?? DEFAULT_SONG
        const isSameSong = get().currentSong?.id === targetSong.id

        if (song) {
          const nextPlaylist = [
            targetSong,
            ...get().playlist.filter(
              (item) => item.id !== targetSong.id && item.id !== DEFAULT_SONG.id,
            ),
          ]

          set({
            currentSong: targetSong,
            playlist: nextPlaylist.length > 0 ? nextPlaylist : [DEFAULT_SONG],
            isPlaying: true,
            progress: 0,
            duration: targetSong.duration,
          })
          useUserStore.getState().addRecentPlay(targetSong)
          await loadAndPlaySong(targetSong)
          return
        }

        if (isSameSong && playerSound) {
          await playerSound.playAsync()
          set({ isPlaying: true })
          return
        }

        set({
          currentSong: targetSong,
          isPlaying: true,
          duration: targetSong.duration,
        })
        useUserStore.getState().addRecentPlay(targetSong)
        await loadAndPlaySong(targetSong)
      },
      pause: async () => {
        if (playerSound) {
          try {
            await playerSound.pauseAsync()
          } catch {
            // ignore
          }
        }
        set({ isPlaying: false })
      },
      togglePlay: async () => {
        if (get().isPlaying) {
          await get().pause()
          return
        }
        await get().play()
      },
      next: async () => {
        const playlist = get().playlist.filter((item) => item.id !== DEFAULT_SONG.id)
        if (playlist.length === 0) return
        const currentId = get().currentSong?.id
        const index = Math.max(0, playlist.findIndex((item) => item.id === currentId))
        const nextSong = playlist[(index + 1) % playlist.length]
        await get().play(nextSong)
      },
      prev: async () => {
        const playlist = get().playlist.filter((item) => item.id !== DEFAULT_SONG.id)
        if (playlist.length === 0) return
        const currentId = get().currentSong?.id
        const index = Math.max(0, playlist.findIndex((item) => item.id === currentId))
        const prevSong = playlist[(index - 1 + playlist.length) % playlist.length]
        await get().play(prevSong)
      },
      seek: async (progress) => {
        if (playerSound) {
          try {
            const status = await playerSound.getStatusAsync()
            if (status.isLoaded && status.durationMillis) {
              await playerSound.setPositionAsync((progress / 100) * status.durationMillis)
            }
          } catch {
            // ignore seek errors
          }
        }
        set({ progress })
      },
      removeFromPlaylist: async (songId) => {
        const nextPlaylist = get().playlist.filter((item) => item.id !== songId && item.id !== DEFAULT_SONG.id)

        if (nextPlaylist.length === 0) {
          await get().clearPlaylist()
          return
        }

        const removedCurrent = get().currentSong?.id === songId
        set({ playlist: nextPlaylist })

        if (removedCurrent) {
          await get().play(nextPlaylist[0])
        }
      },
      clearPlaylist: async () => {
        await unloadSound()
        set({
          currentSong: DEFAULT_SONG,
          playlist: [DEFAULT_SONG],
          isPlaying: false,
          progress: 0,
          duration: 0,
        })
      },
      resumeFromPlaylist: async () => {
        const playlist = get().playlist
        const currentSong = get().currentSong

        if ((!currentSong || currentSong.id === DEFAULT_SONG.id) && playlist.length > 0) {
          const firstRealSong = playlist.find((item) => item.id !== DEFAULT_SONG.id)
          if (firstRealSong) {
            set({ currentSong: firstRealSong, duration: firstRealSong.duration })
          }
        }
      },
    }),
    {
      name: "wave-native-player-store",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        currentSong: state.currentSong,
        playlist: state.playlist,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return
        state.syncStatus({
          isPlaying: false,
          progress: 0,
          duration: state.currentSong?.duration ?? 0,
        })
      },
    },
  ),
)

function useAppTheme() {
  const settings = useUserStore((state) => state.settings)
  return {
    colors: PALETTES[settings.colorScheme],
    fontScale: FONT_SCALE[settings.fontSize],
  }
}

function textSize(base: number, fontScale: number) {
  return Math.round(base * fontScale)
}

function Screen({
  children,
  scroll = true,
}: {
  children: React.ReactNode
  scroll?: boolean
}) {
  const { colors } = useAppTheme()

  if (scroll) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.page }]}>
        <ScrollView
          contentContainerStyle={styles.screenContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.page }]}>
      <View style={styles.screenContent}>{children}</View>
    </SafeAreaView>
  )
}

function SectionCard({
  children,
  style,
}: {
  children: React.ReactNode
  style?: object
}) {
  const { colors } = useAppTheme()
  return (
    <View
      style={[
        styles.sectionCard,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      {children}
    </View>
  )
}

function RowButton({
  label,
  desc,
  onPress,
}: {
  label: string
  desc?: string
  onPress: () => void
}) {
  const { colors, fontScale } = useAppTheme()
  return (
    <TouchableOpacity
      activeOpacity={0.86}
      onPress={onPress}
      style={[styles.rowButton, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <View style={{ flex: 1 }}>
        <Text style={[styles.rowTitle, { color: colors.text, fontSize: textSize(15, fontScale) }]}>
          {label}
        </Text>
        {desc ? (
          <Text
            style={[
              styles.rowDesc,
              { color: colors.textFaint, fontSize: textSize(12, fontScale) },
            ]}
          >
            {desc}
          </Text>
        ) : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
    </TouchableOpacity>
  )
}

function SongRow({
  song,
  active,
  onPress,
  onToggleFavorite,
  favorite,
  onLongPress,
}: {
  song: Song
  active?: boolean
  onPress: () => void
  onToggleFavorite?: () => void
  favorite?: boolean
  onLongPress?: () => void
}) {
  const { colors, fontScale } = useAppTheme()
  return (
    <TouchableOpacity
      activeOpacity={0.86}
      onPress={onPress}
      onLongPress={onLongPress}
      style={[styles.songRow, { borderBottomColor: colors.border }]}
    >
      <Image source={{ uri: song.cover }} style={styles.songCover} />
      <View style={styles.songMeta}>
        <Text
          numberOfLines={1}
          style={[
            styles.songTitle,
            {
              color: active ? colors.accent : colors.text,
              fontSize: textSize(14, fontScale),
            },
          ]}
        >
          {song.title}
        </Text>
        <Text
          numberOfLines={1}
          style={[styles.songSubtitle, { color: colors.textMuted, fontSize: textSize(12, fontScale) }]}
        >
          {song.artist}
        </Text>
      </View>
      {onToggleFavorite ? (
        <TouchableOpacity
          onPress={onToggleFavorite}
          hitSlop={8}
          style={styles.favoriteButton}
        >
          <Ionicons
            name={favorite ? "heart" : "heart-outline"}
            size={18}
            color={favorite ? colors.accent : colors.textFaint}
          />
        </TouchableOpacity>
      ) : active ? (
        <Ionicons name="musical-notes" size={18} color={colors.accent} />
      ) : null}
    </TouchableOpacity>
  )
}

function HomeScreen() {
  const { colors, fontScale } = useAppTheme()
  const playlist = usePlayerStore((state) => state.playlist)
  const currentSong = usePlayerStore((state) => state.currentSong)
  const isPlaying = usePlayerStore((state) => state.isPlaying)
  const progress = usePlayerStore((state) => state.progress)
  const duration = usePlayerStore((state) => state.duration)
  const play = usePlayerStore((state) => state.play)
  const pause = usePlayerStore((state) => state.pause)
  const togglePlay = usePlayerStore((state) => state.togglePlay)
  const next = usePlayerStore((state) => state.next)
  const prev = usePlayerStore((state) => state.prev)
  const seek = usePlayerStore((state) => state.seek)
  const removeFromPlaylist = usePlayerStore((state) => state.removeFromPlaylist)
  const clearPlaylist = usePlayerStore((state) => state.clearPlaylist)
  const resumeFromPlaylist = usePlayerStore((state) => state.resumeFromPlaylist)
  const isFavorite = useUserStore((state) => state.isFavorite)
  const toggleFavorite = useUserStore((state) => state.toggleFavorite)
  const [playlistVisible, setPlaylistVisible] = useState(false)

  useEffect(() => {
    void resumeFromPlaylist()
  }, [resumeFromPlaylist])

  const displaySong = currentSong ?? playlist[0] ?? DEFAULT_SONG
  const displayDuration = duration || displaySong.duration
  const currentSeconds = Math.floor((progress / 100) * displayDuration)
  const hasRealPlaylist = playlist.some((item) => item.id !== DEFAULT_SONG.id)

  return (
    <Screen>
      <View style={styles.homeTopBar}>
        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => setPlaylistVisible(true)}
        >
          <Ionicons name="list" size={20} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => toggleFavorite(displaySong)}
          disabled={displaySong.id === DEFAULT_SONG.id}
        >
          <Ionicons
            name={isFavorite(displaySong.id) ? "heart" : "heart-outline"}
            size={20}
            color={isFavorite(displaySong.id) ? colors.accent : colors.text}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.albumWrap}>
        <View style={[styles.albumShadow, { backgroundColor: colors.accentSoft }]} />
        <Image source={{ uri: displaySong.cover }} style={styles.albumCover} />
      </View>

      <Text style={[styles.heroTitle, { color: colors.text, fontSize: textSize(26, fontScale) }]}>
        {displaySong.title}
      </Text>
      <Text style={[styles.heroSubtitle, { color: colors.textMuted, fontSize: textSize(16, fontScale) }]}>
        {displaySong.artist || "等待添加歌曲"}
      </Text>

      <SectionCard style={styles.playerCard}>
        <Slider
          value={progress}
          onSlidingComplete={(value) => {
            void seek(value)
          }}
          minimumValue={0}
          maximumValue={100}
          minimumTrackTintColor={colors.accent}
          maximumTrackTintColor={colors.accentSoft}
          thumbTintColor={colors.accent}
        />
        <View style={styles.timeRow}>
          <Text style={[styles.caption, { color: colors.textMuted }]}>{formatTime(currentSeconds)}</Text>
          <Text style={[styles.caption, { color: colors.textMuted }]}>{formatTime(displayDuration)}</Text>
        </View>

        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={[styles.controlButton, { backgroundColor: colors.cardStrong }]}
            onPress={() => {
              void prev()
            }}
            disabled={!hasRealPlaylist}
          >
            <Ionicons name="play-skip-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.primaryControl, { backgroundColor: colors.accent }]}
            onPress={() => {
              if (displaySong.id === DEFAULT_SONG.id) {
                Alert.alert("暂无歌曲", "请先去搜索页添加并播放歌曲。")
                return
              }
              void togglePlay()
            }}
          >
            <Ionicons name={isPlaying ? "pause" : "play"} size={28} color="#ffffff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.controlButton, { backgroundColor: colors.cardStrong }]}
            onPress={() => {
              void next()
            }}
            disabled={!hasRealPlaylist}
          >
            <Ionicons name="play-skip-forward" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.secondaryActions}>
          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: colors.border }]}
            onPress={() => {
              if (isPlaying) {
                void pause()
              } else {
                void play()
              }
            }}
          >
            <Text style={[styles.secondaryText, { color: colors.text }]}>
              {isPlaying ? "暂停播放" : "继续播放"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: colors.border }]}
            onPress={() =>
              Alert.alert("清空播放列表", "确定要清空所有歌曲吗？", [
                { text: "取消", style: "cancel" },
                {
                  text: "清空",
                  style: "destructive",
                  onPress: () => {
                    void clearPlaylist()
                  },
                },
              ])
            }
          >
            <Text style={[styles.secondaryText, { color: colors.text }]}>清空列表</Text>
          </TouchableOpacity>
        </View>
      </SectionCard>

      <Modal visible={playlistVisible} animationType="slide" transparent>
        <Pressable style={[styles.modalMask, { backgroundColor: colors.overlay }]} onPress={() => setPlaylistVisible(false)}>
          <Pressable
            style={[styles.modalPanel, { backgroundColor: colors.card }]}
            onPress={(event) => event.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>播放列表</Text>
              <TouchableOpacity onPress={() => setPlaylistVisible(false)}>
                <Ionicons name="close" size={22} color={colors.text} />
              </TouchableOpacity>
            </View>
            {playlist.filter((item) => item.id !== DEFAULT_SONG.id).length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="musical-notes-outline" size={36} color={colors.textFaint} />
                <Text style={[styles.caption, { color: colors.textFaint }]}>播放列表为空</Text>
              </View>
            ) : (
              <FlatList
                data={playlist.filter((item) => item.id !== DEFAULT_SONG.id)}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <SongRow
                    song={item}
                    active={currentSong?.id === item.id}
                    onPress={() => {
                      setPlaylistVisible(false)
                      void play(item)
                    }}
                    onToggleFavorite={() => toggleFavorite(item)}
                    favorite={isFavorite(item.id)}
                    onLongPress={() =>
                      Alert.alert("移除歌曲", `从播放列表移除「${item.title}」？`, [
                        { text: "取消", style: "cancel" },
                        {
                          text: "移除",
                          style: "destructive",
                          onPress: () => {
                            void removeFromPlaylist(item.id)
                          },
                        },
                      ])
                    }
                  />
                )}
              />
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </Screen>
  )
}

function SearchScreen() {
  const { colors, fontScale } = useAppTheme()
  const query = useSearchStore((state) => state.query)
  const history = useSearchStore((state) => state.history)
  const results = useSearchStore((state) => state.results)
  const loading = useSearchStore((state) => state.loading)
  const setQuery = useSearchStore((state) => state.setQuery)
  const search = useSearchStore((state) => state.search)
  const removeHistory = useSearchStore((state) => state.removeHistory)
  const clearHistory = useSearchStore((state) => state.clearHistory)
  const currentSong = usePlayerStore((state) => state.currentSong)
  const togglePlay = usePlayerStore((state) => state.togglePlay)
  const play = usePlayerStore((state) => state.play)
  const consumeSearch = useUserStore((state) => state.consumeSearch)
  const getRemainingSearches = useUserStore((state) => state.getRemainingSearches)
  const isFavorite = useUserStore((state) => state.isFavorite)
  const toggleFavorite = useUserStore((state) => state.toggleFavorite)
  const [toast, setToast] = useState("")

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(""), 1400)
    return () => clearTimeout(timer)
  }, [toast])

  const handleSearch = async (value: string) => {
    const trimmed = value.trim()
    if (!trimmed) {
      setQuery("")
      await search("")
      return
    }

    if (!consumeSearch()) {
      Alert.alert("搜索额度已用完", "今日搜索次数已达上限，请明天再试。")
      return
    }

    await search(trimmed)
  }

  return (
    <Screen>
      {toast ? (
        <View style={[styles.toast, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.caption, { color: colors.text }]}>已加入「{toast}」</Text>
        </View>
      ) : null}

      <Text style={[styles.pageTitle, { color: colors.text, fontSize: textSize(28, fontScale) }]}>
        搜索
      </Text>
      <Text style={[styles.pageSubTitle, { color: colors.textMuted }]}>
        今日剩余搜索次数：{getRemainingSearches()}
      </Text>

      <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Ionicons name="search" size={18} color={colors.textFaint} />
        <TextInput
          value={query}
          onChangeText={(value) => {
            setQuery(value)
            if (!value.trim()) {
              void search("")
            }
          }}
          placeholder="搜索歌曲、歌手..."
          placeholderTextColor={colors.textFaint}
          style={[styles.searchInput, { color: colors.text, fontSize: textSize(15, fontScale) }]}
          returnKeyType="search"
          onSubmitEditing={() => {
            void handleSearch(query)
          }}
        />
        {query ? (
          <TouchableOpacity onPress={() => {
            setQuery("")
            void search("")
          }}>
            <Ionicons name="close-circle" size={18} color={colors.textFaint} />
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity
          style={[styles.searchAction, { backgroundColor: colors.accent }]}
          onPress={() => {
            void handleSearch(query)
          }}
        >
          <Ionicons name="arrow-forward" size={16} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {!query && history.length > 0 ? (
        <SectionCard>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>搜索历史</Text>
            <TouchableOpacity onPress={() => clearHistory()}>
              <Text style={[styles.caption, { color: colors.textMuted }]}>全部删除</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.chipWrap}>
            {history.map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.chip, { backgroundColor: colors.cardStrong }]}
                onPress={() => {
                  void handleSearch(item)
                }}
                onLongPress={() =>
                  Alert.alert("删除搜索词", `删除「${item}」？`, [
                    { text: "取消", style: "cancel" },
                    {
                      text: "删除",
                      style: "destructive",
                      onPress: () => removeHistory(item),
                    },
                  ])
                }
              >
                <Text style={[styles.chipText, { color: colors.textMuted }]}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </SectionCard>
      ) : null}

      {query ? (
        <SectionCard style={{ paddingHorizontal: 0 }}>
          <View style={[styles.sectionHeader, { paddingHorizontal: 18 }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>结果</Text>
            <Text style={[styles.caption, { color: colors.textMuted }]}>{results.length} 首歌曲</Text>
          </View>

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator color={colors.accent} />
              <Text style={[styles.caption, { color: colors.textMuted }]}>搜索中...</Text>
            </View>
          ) : results.length === 0 ? (
            <View style={styles.loadingBox}>
              <Text style={[styles.caption, { color: colors.textMuted }]}>未找到相关歌曲</Text>
            </View>
          ) : (
            results.map((song) => (
              <View key={song.id} style={{ paddingHorizontal: 18 }}>
                <SongRow
                  song={song}
                  active={currentSong?.id === song.id}
                  onPress={() => {
                    if (currentSong?.id === song.id) {
                      void togglePlay()
                    } else {
                      void play(song)
                    }
                    setToast(song.title)
                  }}
                  onToggleFavorite={() => toggleFavorite(song)}
                  favorite={isFavorite(song.id)}
                />
              </View>
            ))
          )}
        </SectionCard>
      ) : null}
    </Screen>
  )
}

function ProfileScreen({ navigation }: { navigation: any }) {
  const { colors, fontScale } = useAppTheme()
  const profile = useUserStore((state) => state.profile)
  const favorites = useUserStore((state) => state.favorites)
  const updateName = useUserStore((state) => state.updateName)
  const getRemainingSearches = useUserStore((state) => state.getRemainingSearches)
  const getDailyLimit = useUserStore((state) => state.getDailyLimit)
  const [editing, setEditing] = useState(false)
  const [nameInput, setNameInput] = useState(profile.name)

  useEffect(() => {
    setNameInput(profile.name)
  }, [profile.name])

  const remaining = getRemainingSearches()
  const limit = getDailyLimit()
  const consumedPercent = ((limit - remaining) / limit) * 100

  return (
    <Screen>
      <View style={styles.profileHeader}>
        <View style={[styles.avatar, { backgroundColor: colors.cardStrong }]}>
          <Ionicons name="person" size={30} color={colors.textMuted} />
        </View>
        <View style={{ flex: 1 }}>
          {editing ? (
            <View style={styles.inlineEdit}>
              <TextInput
                value={nameInput}
                onChangeText={setNameInput}
                style={[
                  styles.inlineInput,
                  {
                    color: colors.text,
                    borderColor: colors.border,
                    backgroundColor: colors.card,
                    fontSize: textSize(18, fontScale),
                  },
                ]}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={() => {
                  const trimmed = nameInput.trim()
                  updateName(trimmed || profile.name)
                  setEditing(false)
                }}
              />
              <TouchableOpacity
                style={[styles.smallPrimaryButton, { backgroundColor: colors.accent }]}
                onPress={() => {
                  const trimmed = nameInput.trim()
                  updateName(trimmed || profile.name)
                  setEditing(false)
                }}
              >
                <Text style={styles.smallPrimaryText}>保存</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.inlineEdit}>
              <Text style={[styles.pageTitle, { color: colors.text, fontSize: textSize(26, fontScale) }]}>
                {profile.name}
              </Text>
              <TouchableOpacity onPress={() => setEditing(true)}>
                <Text style={[styles.caption, { color: colors.accent }]}>编辑</Text>
              </TouchableOpacity>
            </View>
          )}
          <Text style={[styles.pageSubTitle, { color: colors.textMuted }]}>
            {favorites.length} 首收藏 · {profile.isVip ? "VIP" : "普通用户"}
          </Text>
        </View>
      </View>

      <SectionCard>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>今日搜索额度</Text>
          <Text style={[styles.caption, { color: colors.textMuted }]}>
            {remaining} / {limit}
          </Text>
        </View>
        <View style={[styles.progressTrack, { backgroundColor: colors.cardStrong }]}>
          <View
            style={[
              styles.progressFill,
              { backgroundColor: colors.accent, width: `${consumedPercent}%` },
            ]}
          />
        </View>
      </SectionCard>

      <RowButton
        label="点赞列表"
        desc={`${favorites.length} 首歌曲`}
        onPress={() => navigation.navigate("Favorites")}
      />
      <RowButton
        label="设置"
        desc="通用设置、语言、实验功能"
        onPress={() => navigation.navigate("Settings")}
      />
    </Screen>
  )
}

function FavoritesScreen() {
  const { colors, fontScale } = useAppTheme()
  const favorites = useUserStore((state) => state.favorites)
  const currentSong = usePlayerStore((state) => state.currentSong)
  const togglePlay = usePlayerStore((state) => state.togglePlay)
  const play = usePlayerStore((state) => state.play)

  return (
    <Screen>
      <Text style={[styles.pageTitle, { color: colors.text, fontSize: textSize(28, fontScale) }]}>
        点赞列表
      </Text>
      <Text style={[styles.pageSubTitle, { color: colors.textMuted }]}>
        共 {favorites.length} 首已收藏歌曲
      </Text>

      <SectionCard style={{ paddingHorizontal: 0 }}>
        {favorites.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="heart-outline" size={36} color={colors.textFaint} />
            <Text style={[styles.caption, { color: colors.textFaint }]}>还没有收藏的歌曲</Text>
          </View>
        ) : (
          favorites.map((song) => (
            <View key={song.id} style={{ paddingHorizontal: 18 }}>
              <SongRow
                song={song}
                active={currentSong?.id === song.id}
                onPress={() => {
                  if (currentSong?.id === song.id) {
                    void togglePlay()
                  } else {
                    void play(song)
                  }
                }}
              />
            </View>
          ))
        )}
      </SectionCard>
    </Screen>
  )
}

function SettingsScreen({ navigation }: { navigation: any }) {
  const { colors, fontScale } = useAppTheme()

  return (
    <Screen>
      <Text style={[styles.pageTitle, { color: colors.text, fontSize: textSize(28, fontScale) }]}>
        设置
      </Text>
      <Text style={[styles.pageSubTitle, { color: colors.textMuted }]}>配置界面偏好与应用信息</Text>
      {SETTINGS_ITEMS.map((item) => (
        <RowButton
          key={item.route}
          label={item.label}
          desc={item.desc}
          onPress={() => navigation.navigate(item.route)}
        />
      ))}
    </Screen>
  )
}

function SettingsGeneralScreen() {
  const { colors, fontScale } = useAppTheme()
  const settings = useUserStore((state) => state.settings)
  const updateSettings = useUserStore((state) => state.updateSettings)

  return (
    <Screen>
      <Text style={[styles.pageTitle, { color: colors.text, fontSize: textSize(28, fontScale) }]}>
        通用设置
      </Text>

      <SectionCard>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>字体大小</Text>
        <View style={styles.optionGrid}>
          {FONT_OPTIONS.map((option) => {
            const active = settings.fontSize === option.value
            return (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionButton,
                  {
                    backgroundColor: active ? colors.accent : colors.cardStrong,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => updateSettings({ fontSize: option.value })}
              >
                <Text style={{ color: active ? "#ffffff" : colors.text }}>{option.label}</Text>
              </TouchableOpacity>
            )
          })}
        </View>
      </SectionCard>

      <SectionCard>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>App 配色</Text>
        <View style={styles.optionGrid}>
          {COLOR_OPTIONS.map((option) => {
            const active = settings.colorScheme === option.value
            return (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionButton,
                  {
                    backgroundColor: active ? colors.accent : colors.cardStrong,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => updateSettings({ colorScheme: option.value })}
              >
                <View style={[styles.colorDot, { backgroundColor: option.color }]} />
                <Text style={{ color: active ? "#ffffff" : colors.text }}>{option.label}</Text>
              </TouchableOpacity>
            )
          })}
        </View>
      </SectionCard>
    </Screen>
  )
}

function SettingsExperimentalScreen() {
  const { colors, fontScale } = useAppTheme()
  const settings = useUserStore((state) => state.settings)
  const updateSettings = useUserStore((state) => state.updateSettings)

  return (
    <Screen>
      <Text style={[styles.pageTitle, { color: colors.text, fontSize: textSize(28, fontScale) }]}>
        实验功能
      </Text>
      <SectionCard>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>定时关闭</Text>
        <Text style={[styles.pageSubTitle, { color: colors.textMuted }]}>到达设定时间后自动暂停播放</Text>
        <View style={styles.optionGrid}>
          {TIMER_OPTIONS.map((option) => {
            const active = settings.timerMinutes === option.value
            return (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionButton,
                  {
                    backgroundColor: active ? colors.accent : colors.cardStrong,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => updateSettings({ timerMinutes: option.value })}
              >
                <Text style={{ color: active ? "#ffffff" : colors.text }}>{option.label}</Text>
              </TouchableOpacity>
            )
          })}
        </View>
      </SectionCard>
    </Screen>
  )
}

function SettingsLanguageScreen() {
  const { colors, fontScale } = useAppTheme()
  const settings = useUserStore((state) => state.settings)
  const updateSettings = useUserStore((state) => state.updateSettings)

  return (
    <Screen>
      <Text style={[styles.pageTitle, { color: colors.text, fontSize: textSize(28, fontScale) }]}>
        语言设置
      </Text>
      <SectionCard>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>选择 App 显示语言</Text>
        <View style={styles.optionGrid}>
          {LANG_OPTIONS.map((option) => {
            const active = settings.language === option.value
            return (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionButton,
                  {
                    backgroundColor: active ? colors.accent : colors.cardStrong,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => updateSettings({ language: option.value })}
              >
                <Text style={{ color: active ? "#ffffff" : colors.text }}>{option.label}</Text>
              </TouchableOpacity>
            )
          })}
        </View>
      </SectionCard>
    </Screen>
  )
}

function SettingsAboutScreen() {
  const { colors, fontScale } = useAppTheme()
  const items = useMemo(
    () => [
      { label: "应用名称", value: "Wave Music Native" },
      { label: "版本号", value: "v1.0.0" },
      { label: "官网", value: "https://zero.lunarbyte.pw" },
    ],
    [],
  )

  return (
    <Screen>
      <Text style={[styles.pageTitle, { color: colors.text, fontSize: textSize(28, fontScale) }]}>
        关于我们
      </Text>
      <SectionCard>
        {items.map((item, index) => (
          <TouchableOpacity
            key={item.label}
            activeOpacity={item.label === "官网" ? 0.8 : 1}
            onPress={() => {
              if (item.label === "官网") {
                void Linking.openURL(item.value)
              }
            }}
            style={[
              styles.aboutRow,
              index < items.length - 1 ? { borderBottomColor: colors.border, borderBottomWidth: 1 } : null,
            ]}
          >
            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{item.label}</Text>
            <Text style={[styles.aboutValue, { color: colors.text }]}>{item.value.replace("https://", "")}</Text>
          </TouchableOpacity>
        ))}
      </SectionCard>
    </Screen>
  )
}

function TabsNavigator() {
  const { colors } = useAppTheme()
  const isPlaying = usePlayerStore((state) => state.isPlaying)

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          height: 68,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarIcon: ({ color, size, focused }) => {
          const iconName =
            route.name === "Search"
              ? "search"
              : route.name === "Home"
                ? focused && isPlaying
                  ? "pause"
                  : "play"
                : "person"
          return <Ionicons name={iconName} size={size} color={color} />
        },
      })}
    >
      <Tab.Screen name="Search" component={SearchScreen} options={{ title: "搜索" }} />
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: "首页" }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: "我的" }} />
    </Tab.Navigator>
  )
}

export default function App() {
  const settings = useUserStore((state) => state.settings)
  const currentSongId = usePlayerStore((state) => state.currentSong?.id)
  const isPlaying = usePlayerStore((state) => state.isPlaying)
  const colors = PALETTES[settings.colorScheme]

  useEffect(() => {
    void Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      staysActiveInBackground: false,
    })

    return () => {
      void unloadSound()
    }
  }, [])

  useEffect(() => {
    if (!isPlaying || settings.timerMinutes === 0) return

    const timer = setTimeout(() => {
      void usePlayerStore.getState().pause()
      Alert.alert("定时暂停", "已根据实验功能配置自动暂停播放。")
    }, settings.timerMinutes * 60 * 1000)

    return () => clearTimeout(timer)
  }, [settings.timerMinutes, isPlaying, currentSongId])

  return (
    <>
      <StatusBar style="dark" />
      <NavigationContainer
        theme={{
          ...DefaultTheme,
          colors: {
            ...DefaultTheme.colors,
            background: colors.page,
            card: colors.card,
            text: colors.text,
            border: colors.border,
            primary: colors.accent,
          },
        }}
      >
        <RootStack.Navigator
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.page },
          }}
        >
          <RootStack.Screen name="Tabs" component={TabsNavigator} />
          <RootStack.Screen name="Favorites" component={FavoritesScreen} />
          <RootStack.Screen name="Settings" component={SettingsScreen} />
          <RootStack.Screen name="SettingsGeneral" component={SettingsGeneralScreen} />
          <RootStack.Screen name="SettingsExperimental" component={SettingsExperimentalScreen} />
          <RootStack.Screen name="SettingsLanguage" component={SettingsLanguageScreen} />
          <RootStack.Screen name="SettingsAbout" component={SettingsAboutScreen} />
        </RootStack.Navigator>
      </NavigationContainer>
    </>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  screenContent: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 120,
    gap: 14,
  },
  sectionCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    gap: 12,
  },
  rowButton: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rowTitle: {
    fontWeight: "600",
  },
  rowDesc: {
    marginTop: 4,
  },
  pageTitle: {
    fontWeight: "700",
  },
  pageSubTitle: {
    fontSize: 13,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  caption: {
    fontSize: 12,
  },
  searchBar: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  searchInput: {
    flex: 1,
    minHeight: 24,
  },
  searchAction: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 14,
  },
  chipText: {
    fontSize: 13,
  },
  songRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  songCover: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: "#ececec",
  },
  songMeta: {
    flex: 1,
  },
  songTitle: {
    fontWeight: "600",
  },
  songSubtitle: {
    marginTop: 4,
  },
  favoriteButton: {
    padding: 6,
  },
  loadingBox: {
    paddingVertical: 28,
    gap: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  toast: {
    alignSelf: "flex-start",
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  inlineEdit: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  inlineInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  smallPrimaryButton: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  smallPrimaryText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "600",
  },
  progressTrack: {
    height: 10,
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
  },
  homeTopBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  albumWrap: {
    marginTop: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  albumShadow: {
    position: "absolute",
    width: 250,
    height: 250,
    borderRadius: 140,
    opacity: 0.85,
    transform: [{ scale: 1.15 }],
  },
  albumCover: {
    width: 280,
    height: 280,
    borderRadius: 28,
    backgroundColor: "#ededed",
  },
  heroTitle: {
    marginTop: 10,
    textAlign: "center",
    fontWeight: "700",
  },
  heroSubtitle: {
    textAlign: "center",
    marginTop: 2,
  },
  playerCard: {
    marginTop: 8,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: -4,
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    marginTop: 10,
  },
  controlButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryControl: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 6,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  secondaryText: {
    fontSize: 13,
    fontWeight: "600",
  },
  modalMask: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalPanel: {
    maxHeight: "72%",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  emptyState: {
    paddingVertical: 34,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  optionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 6,
  },
  optionButton: {
    minWidth: 92,
    minHeight: 48,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  colorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  aboutRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    gap: 16,
  },
  aboutValue: {
    fontSize: 14,
    fontWeight: "500",
  },
})
