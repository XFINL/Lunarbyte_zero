import { create } from "zustand"
import type { Song } from "@/types"
import { playAudio, resumeAudio, pauseAudio } from "@/lib/audio"
import { getItem, setItem, removeItem } from "@/lib/storage"

const PLAYLIST_KEY = "playlist"
const CURRENT_ID_KEY = "currentSongId"

const DEFAULT_SONG: Song = {
  id: "__default__",
  title: "请添加歌曲",
  artist: "",
  cover: "https://t.alcy.cc/moez",
  duration: 0,
  album: "",
}

interface PlayerState {
  currentSong: Song | null
  isPlaying: boolean
  progress: number
  playlist: Song[]
  initialized: boolean
  play: (song?: Song) => void
  pause: () => void
  togglePlay: () => void
  next: () => void
  prev: () => void
  setProgress: (progress: number) => void
  setPlaylist: (songs: Song[]) => void
  removeFromPlaylist: (songId: string) => void
  clearPlaylist: () => void
  resumeFromPlaylist: () => void
  hydrate: () => Promise<void>
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentSong: null,
  isPlaying: false,
  progress: 0,
  playlist: [DEFAULT_SONG],
  initialized: false,

  hydrate: async () => {
    const storedPlaylist = await getItem<Song[]>(PLAYLIST_KEY, [DEFAULT_SONG])
    const finalPlaylist =
      storedPlaylist.length > 0 ? storedPlaylist : [DEFAULT_SONG]
    const savedId = await getItem<string | null>(CURRENT_ID_KEY, null)
    const currentSong: Song | null =
      savedId ? (finalPlaylist.find((s) => s.id === savedId) ?? null) : null
    set({
      playlist: finalPlaylist,
      currentSong,
      initialized: true,
    })
  },

  play: (song) => {
    if (song) {
      const { playlist } = get()
      const filtered = playlist.filter(
        (s) => s.id !== song.id && s.id !== DEFAULT_SONG.id,
      )
      const updatedPlaylist = [song, ...filtered]
      setItem(PLAYLIST_KEY, updatedPlaylist)
      setItem(CURRENT_ID_KEY, song.id)
      set({
        currentSong: song,
        playlist: updatedPlaylist,
        isPlaying: true,
        progress: 0,
      })
      if (song.url) {
        playAudio(song.url)
      }
    } else {
      const { currentSong } = get()
      if (currentSong?.url) {
        resumeAudio()
      }
      set({ isPlaying: true })
    }
  },

  pause: () => {
    pauseAudio()
    set({ isPlaying: false })
  },

  togglePlay: () => {
    const { isPlaying } = get()
    if (isPlaying) {
      pauseAudio()
      set({ isPlaying: false })
    } else {
      const { currentSong } = get()
      if (currentSong?.url) {
        resumeAudio()
      }
      set({ isPlaying: true })
    }
  },

  next: () => {
    const { currentSong, playlist } = get()
    if (!currentSong || playlist.length === 0) return
    const idx = playlist.findIndex((s) => s.id === currentSong.id)
    const nextIdx = (idx + 1) % playlist.length
    const nextSong = playlist[nextIdx]
    if (nextSong.url) playAudio(nextSong.url)
    setItem(CURRENT_ID_KEY, nextSong.id)
    set({ currentSong: nextSong, isPlaying: true, progress: 0 })
  },

  prev: () => {
    const { currentSong, playlist } = get()
    if (!currentSong || playlist.length === 0) return
    const idx = playlist.findIndex((s) => s.id === currentSong.id)
    const prevIdx = (idx - 1 + playlist.length) % playlist.length
    const prevSong = playlist[prevIdx]
    if (prevSong.url) playAudio(prevSong.url)
    setItem(CURRENT_ID_KEY, prevSong.id)
    set({ currentSong: prevSong, isPlaying: true, progress: 0 })
  },

  setProgress: (progress) => set({ progress }),

  setPlaylist: (songs) => {
    setItem(PLAYLIST_KEY, songs)
    set({ playlist: songs })
  },

  removeFromPlaylist: (songId) => {
    if (songId === DEFAULT_SONG.id) return
    const { playlist, currentSong } = get()
    const updated = playlist.filter((s) => s.id !== songId)
    setItem(PLAYLIST_KEY, updated)
    if (currentSong?.id === songId) {
      const next = updated.length > 0 ? updated[0] : null
      if (next?.url) playAudio(next.url)
      setItem(CURRENT_ID_KEY, next?.id ?? null)
      set({
        playlist: updated,
        currentSong: next,
        isPlaying: next !== null,
        progress: 0,
      })
    } else {
      set({ playlist: updated })
    }
  },

  clearPlaylist: () => {
    const { currentSong } = get()
    if (currentSong?.url) pauseAudio()
    setItem(PLAYLIST_KEY, [DEFAULT_SONG])
    removeItem(CURRENT_ID_KEY)
    set({
      playlist: [DEFAULT_SONG],
      currentSong: null,
      isPlaying: false,
      progress: 0,
    })
  },

  resumeFromPlaylist: () => {
    const { currentSong, playlist } = get()
    let songList = playlist
    if (!currentSong && songList.length > 0) {
      const song = songList[0]
      setItem(CURRENT_ID_KEY, song.id)
      if (song.url) playAudio(song.url)
      set({ currentSong: song, isPlaying: true, progress: 0 })
    }
  },
}))