import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { Song } from "@/data/mock"
import { searchSongs } from "@/lib/api"
import { storage } from "@/lib/storage"

function toSong(api: { id: string; title: string; author: string; pic: string; url: string }): Song {
  return {
    id: api.id,
    title: api.title,
    artist: api.author,
    cover: api.pic.replace(/^http:/, "https:"),
    duration: 240,
    album: api.title,
    url: api.url,
  }
}

interface SearchState {
  query: string
  history: string[]
  results: Song[]
  loading: boolean
  setQuery: (q: string) => void
  search: (q: string) => Promise<void>
  addHistory: (keyword: string) => void
  removeHistory: (keyword: string) => void
  clearHistory: () => void
}

export const useSearchStore = create<SearchState>()(
  persist(
    (set, get) => ({
      query: "",
      history: [],
      results: [],
      loading: false,
      setQuery: (q) => set({ query: q }),
      search: async (q) => {
        if (!q.trim()) {
          set({ results: [], loading: false })
          return
        }
        set({ loading: true })
        try {
          const apiResults = await searchSongs(q.trim())
          set({ results: apiResults.map(toSong), loading: false })
          get().addHistory(q.trim())
        } catch {
          set({ results: [], loading: false })
        }
      },
      addHistory: (keyword) => {
        const { history } = get()
        const filtered = history.filter((h) => h !== keyword)
        const updated = [keyword, ...filtered].slice(0, 10)
        set({ history: updated })
      },
      removeHistory: (keyword) => {
        const updated = get().history.filter((h) => h !== keyword)
        set({ history: updated })
      },
      clearHistory: () => {
        set({ history: [] })
      },
    }),
    {
      name: "search-storage",
      storage: createJSONStorage(() => storage),
      partialize: (state) => ({ history: state.history }),
    }
  )
)
