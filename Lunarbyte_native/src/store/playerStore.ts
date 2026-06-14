import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { Song } from "@/data/mock"
import { playAudio, pauseAudio, resumeAudio } from "@/lib/audio"
import { storage } from "@/lib/storage"

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

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      currentSong: null,
      isPlaying: false,
      progress: 0,
      playlist: [DEFAULT_SONG],
      play: async (song) => {
        if (song) {
          const { playlist } = get()
          const filtered = playlist.filter((s) => s.id !== song.id && s.id !== DEFAULT_SONG.id)
          const updatedPlaylist = [song, ...filtered]
          set({ currentSong: song, playlist: updatedPlaylist, isPlaying: true, progress: 0 })

          if (song.url) {
            await playAudio(song.url)
          }
        } else {
          const { currentSong } = get()
          if (currentSong?.url) {
            await resumeAudio()
          }
          set({ isPlaying: true })
        }
      },
      pause: async () => {
        await pauseAudio()
        set({ isPlaying: false })
      },
      togglePlay: async () => {
        const { isPlaying } = get()
        if (isPlaying) {
          await pauseAudio()
          set({ isPlaying: false })
        } else {
          const { currentSong } = get()
          if (currentSong?.url) {
            await resumeAudio()
          }
          set({ isPlaying: true })
        }
      },
      next: async () => {
        const { currentSong, playlist } = get()
        if (!currentSong || playlist.length === 0) return
        const idx = playlist.findIndex((s) => s.id === currentSong.id)
        const nextIdx = (idx + 1) % playlist.length
        const nextSong = playlist[nextIdx]
        if (nextSong.url) await playAudio(nextSong.url)
        set({ currentSong: nextSong, isPlaying: true, progress: 0 })
      },
      prev: async () => {
        const { currentSong, playlist } = get()
        if (!currentSong || playlist.length === 0) return
        const idx = playlist.findIndex((s) => s.id === currentSong.id)
        const prevIdx = (idx - 1 + playlist.length) % playlist.length
        const prevSong = playlist[prevIdx]
        if (prevSong.url) await playAudio(prevSong.url)
        set({ currentSong: prevSong, isPlaying: true, progress: 0 })
      },
      setProgress: (progress) => set({ progress }),
      setPlaylist: (songs) => set({ playlist: songs }),
      removeFromPlaylist: async (songId) => {
        if (songId === DEFAULT_SONG.id) return
        const { playlist, currentSong } = get()
        const updated = playlist.filter((s) => s.id !== songId)
        if (currentSong?.id === songId) {
          const next = updated.length > 0 ? updated[0] : null
          if (next?.url) await playAudio(next.url)
          set({ playlist: updated, currentSong: next, isPlaying: next !== null, progress: 0 })
        } else {
          set({ playlist: updated })
        }
      },
      clearPlaylist: async () => {
        const { currentSong } = get()
        if (currentSong?.url) await pauseAudio()
        set({ playlist: [DEFAULT_SONG], currentSong: null, isPlaying: false, progress: 0 })
      },
      resumeFromPlaylist: async () => {
        const { currentSong, playlist } = get()

        if (!currentSong && playlist.length > 0) {
          const song = playlist[0]
          if (song.url) await playAudio(song.url)
          set({ currentSong: song, isPlaying: true, progress: 0 })
        }
      },
    }),
    {
      name: "player-storage",
      storage: createJSONStorage(() => storage),
      partialize: (state) => ({
        playlist: state.playlist,
        currentSong: state.currentSong,
      }),
    }
  )
)
