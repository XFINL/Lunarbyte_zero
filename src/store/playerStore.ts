import { create } from "zustand"
import type { Song } from "@/data/mock"
import { mockSongs } from "@/data/mock"

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
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentSong: mockSongs[0],
  isPlaying: false,
  progress: 0,
  playlist: mockSongs,
  play: (song) => {
    if (song) {
      set({ currentSong: song, isPlaying: true, progress: 0 })
    } else {
      set({ isPlaying: true })
    }
  },
  pause: () => set({ isPlaying: false }),
  togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),
  next: () => {
    const { currentSong, playlist } = get()
    if (!currentSong || playlist.length === 0) return
    const idx = playlist.findIndex((s) => s.id === currentSong.id)
    const nextIdx = (idx + 1) % playlist.length
    set({ currentSong: playlist[nextIdx], isPlaying: true, progress: 0 })
  },
  prev: () => {
    const { currentSong, playlist } = get()
    if (!currentSong || playlist.length === 0) return
    const idx = playlist.findIndex((s) => s.id === currentSong.id)
    const prevIdx = (idx - 1 + playlist.length) % playlist.length
    set({ currentSong: playlist[prevIdx], isPlaying: true, progress: 0 })
  },
  setProgress: (progress) => set({ progress }),
  setPlaylist: (songs) => set({ playlist: songs }),
}))