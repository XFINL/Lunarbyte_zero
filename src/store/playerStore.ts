import { create } from "zustand"
import type { Song } from "@/data/mock"
import { playAudio, resumeAudio, pauseAudio } from "@/lib/audio"

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

/** 从 localStorage 加载播放列表，空列表时返回默认占位歌 */
function loadPlaylist(): Song[] {
  try {
    const raw = localStorage.getItem(PLAYLIST_KEY)
    if (raw) {
      const parsed: Song[] = JSON.parse(raw)
      if (parsed.length > 0) return parsed
    }
  } catch { /* ignore */ }
  return [DEFAULT_SONG]
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
  resumeFromPlaylist: () => void
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
        // 先设置状态再加载音频，确保 currentSong 写入 store
        const { playlist } = get()
        // 添加真实歌曲时移走默认占位歌
        const filtered = playlist.filter((s) => s.id !== song.id && s.id !== DEFAULT_SONG.id)
        const updatedPlaylist = [song, ...filtered]
        savePlaylist(updatedPlaylist)
        saveCurrentId(song.id)
        set({ currentSong: song, playlist: updatedPlaylist, isPlaying: true, progress: 0 })

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
      if (songId === DEFAULT_SONG.id) return // 默认歌不可删除
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
      savePlaylist([DEFAULT_SONG])
      saveCurrentId(null)
      set({ playlist: [DEFAULT_SONG], currentSong: null, isPlaying: false, progress: 0 })
    },
    resumeFromPlaylist: () => {
      const { currentSong, playlist } = get()

      // 兜底：内存 playlist 为空但 localStorage 有数据 → 重新加载
      let songList = playlist
      if (songList.length === 0) {
        const stored = loadPlaylist()
        if (stored.length > 0) {
          songList = stored
          // 同时恢复 currentSong
          const saved = loadCurrentSong(stored)
          if (saved) {
            set({ playlist: stored, currentSong: saved })
            return
          }
          set({ playlist: stored })
        }
      }

      if (!currentSong && songList.length > 0) {
        const song = songList[0]
        saveCurrentId(song.id)
        if (song.url) playAudio(song.url)
        set({ currentSong: song, isPlaying: true, progress: 0 })
      }
    },
  }
})