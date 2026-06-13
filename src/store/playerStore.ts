import { create } from "zustand"
import type { Song } from "@/data/mock"
import { mockSongs } from "@/data/mock"
import { playAudio, resumeAudio, pauseAudio } from "@/lib/audio"

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

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentSong: null,
  isPlaying: false,
  progress: 0,
  playlist: [],
  play: (song) => {
    if (song) {
      // 新歌曲：有 URL 就真实播放，否则静默（mock）
      if (song.url) {
        playAudio(song.url)
      }
      set({ currentSong: song, isPlaying: true, progress: 0 })
    } else {
      // 恢复当前歌曲
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
      } else {
        // mock 歌曲无 URL，静默播放
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
    if (nextSong.url) {
      playAudio(nextSong.url)
    }
    set({ currentSong: nextSong, isPlaying: true, progress: 0 })
  },
  prev: () => {
    const { currentSong, playlist } = get()
    if (!currentSong || playlist.length === 0) return
    const idx = playlist.findIndex((s) => s.id === currentSong.id)
    const prevIdx = (idx - 1 + playlist.length) % playlist.length
    const prevSong = playlist[prevIdx]
    if (prevSong.url) {
      playAudio(prevSong.url)
    }
    set({ currentSong: prevSong, isPlaying: true, progress: 0 })
  },
  setProgress: (progress) => set({ progress }),
  setPlaylist: (songs) => set({ playlist: songs }),
  removeFromPlaylist: (songId) => {
    const { playlist, currentSong } = get()
    const updated = playlist.filter((s) => s.id !== songId)
    // 如果移除的是当前歌曲，切到列表第一首
    if (currentSong?.id === songId) {
      const next = updated.length > 0 ? updated[0] : null
      if (next?.url) playAudio(next.url)
      set({ playlist: updated, currentSong: next, isPlaying: next !== null, progress: 0 })
    } else {
      set({ playlist: updated })
    }
  },
  clearPlaylist: () => {
    const { currentSong } = get()
    if (currentSong?.url) pauseAudio()
    set({ playlist: [], currentSong: null, isPlaying: false, progress: 0 })
  },
}))