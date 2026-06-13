import { create } from "zustand"
import type { Song } from "@/data/mock"
import { searchSongs } from "@/lib/api"

/** 将 API 返回数据转为应用的 Song 格式 */
function toSong(api: { id: string; title: string; author: string; pic: string; url: string }): Song {
  return {
    id: api.id,
    title: api.title,
    artist: api.author,
    cover: api.pic.replace(/^http:/, "https:"),
    duration: 240,
    album: api.title,
    url: api.url, // 真实音频地址
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

export const useSearchStore = create<SearchState>((set, get) => ({
  query: "",
  history: ["周杰伦", "邓紫棋", "起风了"],
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
    set({ history: [keyword, ...filtered].slice(0, 10) })
  },
  removeHistory: (keyword) => {
    set((s) => ({ history: s.history.filter((h) => h !== keyword) }))
  },
  clearHistory: () => set({ history: [] }),
}))