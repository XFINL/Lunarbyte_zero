import { create } from "zustand"
import type { Song } from "@/types"
import { searchSongs } from "@/lib/api"
import { getItem, setItem } from "@/lib/storage"

const STORAGE_KEY = "searchHistory"

function toSong(api: {
  id: string
  title: string
  author: string
  pic: string
  url: string
}): Song {
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
  hydrated: boolean
  setQuery: (q: string) => void
  search: (q: string) => Promise<void>
  addHistory: (keyword: string) => void
  removeHistory: (keyword: string) => void
  clearHistory: () => void
  hydrate: () => Promise<void>
}

export const useSearchStore = create<SearchState>((set, get) => ({
  query: "",
  history: [],
  results: [],
  loading: false,
  hydrated: false,

  hydrate: async () => {
    const history = await getItem<string[]>(STORAGE_KEY, [])
    set({ history, hydrated: true })
  },

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
    setItem(STORAGE_KEY, updated)
  },

  removeHistory: (keyword) => {
    const updated = get().history.filter((h) => h !== keyword)
    set({ history: updated })
    setItem(STORAGE_KEY, updated)
  },

  clearHistory: () => {
    set({ history: [] })
    setItem(STORAGE_KEY, [])
  },
}))