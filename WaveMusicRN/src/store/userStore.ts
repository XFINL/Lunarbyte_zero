import { create } from "zustand"
import type { Song, UserProfile, AppSettings, SearchQuota } from "@/types"
import { getItem, setItem } from "@/lib/storage"

const USER_KEY = "userProfile"
const QUOTA_KEY = "searchQuota"
const SETTINGS_KEY = "appSettings"
const FAVORITES_KEY = "favorites"
const RECENT_KEY = "recentPlays"

interface UserState {
  profile: UserProfile
  favorites: Song[]
  recentPlays: Song[]
  quota: SearchQuota
  settings: AppSettings
  hydrated: boolean
  updateName: (name: string) => void
  updateSettings: (s: Partial<AppSettings>) => void
  toggleFavorite: (song: Song) => void
  isFavorite: (songId: string) => boolean
  addRecentPlay: (song: Song) => void
  canSearch: () => boolean
  consumeSearch: () => boolean
  getRemainingSearches: () => number
  getDailyLimit: () => number
  hydrate: () => Promise<void>
}

export const useUserStore = create<UserState>((set, get) => ({
  profile: { name: "音乐爱好者", avatar: "", isVip: false },
  favorites: [],
  recentPlays: [],
  quota: { count: 0, date: new Date().toISOString().slice(0, 10) },
  settings: {
    fontSize: "normal",
    colorScheme: "white",
    language: "zh",
    timerMinutes: 0,
  },
  hydrated: false,

  hydrate: async () => {
    const profile = await getItem<UserProfile>(USER_KEY, {
      name: "音乐爱好者",
      avatar: "",
      isVip: false,
    })
    const quotaRaw = await getItem<SearchQuota>(QUOTA_KEY, {
      count: 0,
      date: new Date().toISOString().slice(0, 10),
    })
    const today = new Date().toISOString().slice(0, 10)
    const quota = quotaRaw.date === today ? quotaRaw : { count: 0, date: today }
    const settings = await getItem<AppSettings>(SETTINGS_KEY, {
      fontSize: "normal",
      colorScheme: "white",
      language: "zh",
      timerMinutes: 0,
    })
    const favorites = await getItem<Song[]>(FAVORITES_KEY, [])
    const recentPlays = await getItem<Song[]>(RECENT_KEY, [])
    set({ profile, quota, settings, favorites, recentPlays, hydrated: true })
  },

  updateName: (name) => {
    const updated = { ...get().profile, name }
    set({ profile: updated })
    setItem(USER_KEY, updated)
  },

  updateSettings: (partial) => {
    const current = get().settings
    const updated = { ...current, ...partial }
    set({ settings: updated })
    setItem(SETTINGS_KEY, updated)
  },

  toggleFavorite: (song) => {
    const { favorites } = get()
    const exists = favorites.some((s) => s.id === song.id)
    const next = exists
      ? favorites.filter((s) => s.id !== song.id)
      : [...favorites, song]
    set({ favorites: next })
    setItem(FAVORITES_KEY, next)
  },

  isFavorite: (songId) => get().favorites.some((s) => s.id === songId),

  addRecentPlay: (song) => {
    const { recentPlays } = get()
    const filtered = recentPlays.filter((s) => s.id !== song.id)
    const next = [song, ...filtered].slice(0, 20)
    set({ recentPlays: next })
    setItem(RECENT_KEY, next)
  },

  canSearch: () => {
    const { quota, profile } = get()
    const max = profile.isVip ? 100 : 12
    return quota.count < max
  },

  consumeSearch: () => {
    const { quota, profile } = get()
    const max = profile.isVip ? 100 : 12
    if (quota.count >= max) return false
    const updated = { count: quota.count + 1, date: quota.date }
    set({ quota: updated })
    setItem(QUOTA_KEY, updated)
    return true
  },

  getRemainingSearches: () => {
    const { quota, profile } = get()
    const max = profile.isVip ? 100 : 12
    return Math.max(0, max - quota.count)
  },

  getDailyLimit: () => {
    return get().profile.isVip ? 100 : 12
  },
}))