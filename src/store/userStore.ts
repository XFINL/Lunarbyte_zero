import { create } from "zustand"
import type { Song } from "@/data/mock"
import { mockSongs } from "@/data/mock"

interface UserState {
  favorites: Song[]
  recentPlays: Song[]
  playlists: { id: string; name: string; songs: Song[] }[]
  toggleFavorite: (song: Song) => void
  isFavorite: (songId: string) => boolean
  addRecentPlay: (song: Song) => void
}

export const useUserStore = create<UserState>((set, get) => ({
  favorites: [mockSongs[0], mockSongs[3]],
  recentPlays: mockSongs.slice(0, 4),
  playlists: [
    { id: "p1", name: "我喜欢", songs: [mockSongs[0], mockSongs[3]] },
    { id: "p2", name: "深夜听", songs: [mockSongs[2], mockSongs[6]] },
    { id: "p3", name: "运动歌单", songs: [mockSongs[1], mockSongs[4]] },
  ],
  toggleFavorite: (song) => {
    const { favorites } = get()
    const exists = favorites.some((s) => s.id === song.id)
    if (exists) {
      set({ favorites: favorites.filter((s) => s.id !== song.id) })
    } else {
      set({ favorites: [...favorites, song] })
    }
  },
  isFavorite: (songId) => get().favorites.some((s) => s.id === songId),
  addRecentPlay: (song) => {
    const { recentPlays } = get()
    const filtered = recentPlays.filter((s) => s.id !== song.id)
    set({ recentPlays: [song, ...filtered].slice(0, 20) })
  },
}))