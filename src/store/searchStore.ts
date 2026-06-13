import { create } from "zustand"
import type { Song } from "@/data/mock"
import { mockSongs } from "@/data/mock"

interface SearchState {
  query: string
  history: string[]
  results: Song[]
  setQuery: (q: string) => void
  search: (q: string) => void
  addHistory: (keyword: string) => void
  removeHistory: (keyword: string) => void
  clearHistory: () => void
}

export const useSearchStore = create<SearchState>((set, get) => ({
  query: "",
  history: ["周杰伦", "邓紫棋", "起风了"],
  results: [],
  setQuery: (q) => set({ query: q }),
  search: (q) => {
    if (!q.trim()) {
      set({ results: [] })
      return
    }
    const keyword = q.toLowerCase()
    const results = mockSongs.filter(
      (s) =>
        s.title.toLowerCase().includes(keyword) ||
        s.artist.toLowerCase().includes(keyword) ||
        s.album.toLowerCase().includes(keyword),
    )
    set({ results })
    if (q.trim()) {
      get().addHistory(q.trim())
    }
  },
  addHistory: (keyword) => {
    const { history } = get()
    const filtered = history.filter((h) => h !== keyword)
    set({ history: [keyword, ...filtered].slice(0, 8) })
  },
  removeHistory: (keyword) => {
    set((s) => ({ history: s.history.filter((h) => h !== keyword) }))
  },
  clearHistory: () => set({ history: [] }),
}))