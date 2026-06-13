import { create } from "zustand"
import type { Song } from "@/data/mock"
import { playAudio, resumeAudio, pauseAudio } from "@/lib/audio"

const PLAYLIST_KEY = "playlist"
const CURRENT_ID_KEY = "currentSongId"

/** 从 localStorage 加载播放列表 */
function loadPlaylist(): Song[] {
  try {
    const raw = localStorage.getItem(PLAYLIST_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return []
}

/** 保存播放列表 */
function savePlaylist(list: Song[]) {
  try { localStorage.setItem(PLAYLIST_KEY, JSON.stringify(list)) } catch { /* ignore */ }
}

/** 从 localStorage 读取上次播放的歌曲 ID，从列表中找回 */
function loadCurrentSong(playlist: Song[]): Song | null {
  try {
    const id = localStorage.getItem(CURRENT_ID_KEY)
    if (id && playlist.length > 0) {
      return playlist.find((s) => s.id === id) ?? null
    }
  } catch { /* ignore */ }
  return null
}

function saveCurrentId(id: string | null) {
  try {
    if (id) localStorage.setItem(CURRENT_ID_KEY, id)
    else localStorage.removeItem(CURRENT_ID_KEY)
  } catch { /* ignore */ }
}

interface PlayerState {
  currentSong: Song | null
  isPlaying: boolean
  progress: number
  playlist: Song[]
  play: (song?: Song) => void
  pause: () => void
  togglePlay: () => void
  next: () => void
  prev: () => void
  setProgress: (progress: number) => void
  setPlaylist: (songs: Song[]) => void
  removeFromPlaylist: (songId: string) => void
  clearPlaylist: () => void
}

export const usePlayerStore = create<PlayerState>((set, get) => {
  const initialPlaylist = loadPlaylist()
  return {
    currentSong: loadCurrentSong(initialPlaylist),
    isPlaying: false,
    progress: 0,
    playlist: initialPlaylist,
    play: (song) => {
      if (song) {
        // 加入播放列表（去重，最新播放置顶）
        const { playlist } = get()
        const filtered = playlist.filter((s) => s.id !== song.id)
        const updatedPlaylist = [song, ...filtered]
        savePlaylist(updatedPlaylist)
        saveCurrentId(song.id)

        if (song.url) {
          playAudio(song.url)
        }
        set({ currentSong: song, playlist: updatedPlaylist, isPlaying: true, progress: 0 })
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
      saveCurrentId(nextSong.id)
      set({ currentSong: nextSong, isPlaying: true, progress: 0 })
    },
    prev: () => {
      const { currentSong, playlist } = get()
      if (!currentSong || playlist.length === 0) return
      const idx = playlist.findIndex((s) => s.id === currentSong.id)
      const prevIdx = (idx - 1 + playlist.length) % playlist.length
      const prevSong = playlist[prevIdx]
      if (prevSong.url) playAudio(prevSong.url)
      saveCurrentId(prevSong.id)
      set({ currentSong: prevSong, isPlaying: true, progress: 0 })
    },
    setProgress: (progress) => set({ progress }),
    setPlaylist: (songs) => {
      savePlaylist(songs)
      set({ playlist: songs })
    },
    removeFromPlaylist: (songId) => {
      const { playlist, currentSong } = get()
      const updated = playlist.filter((s) => s.id !== songId)
      savePlaylist(updated)
      if (currentSong?.id === songId) {
        const next = updated.length > 0 ? updated[0] : null
        if (next?.url) playAudio(next.url)
        saveCurrentId(next?.id ?? null)
        set({ playlist: updated, currentSong: next, isPlaying: next !== null, progress: 0 })
      } else {
        set({ playlist: updated })
      }
    },
    clearPlaylist: () => {
      const { currentSong } = get()
      if (currentSong?.url) pauseAudio()
      savePlaylist([])
      saveCurrentId(null)
      set({ playlist: [], currentSong: null, isPlaying: false, progress: 0 })
    },
  }
})