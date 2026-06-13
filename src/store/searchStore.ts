import { create } from "zustand"
import type { Song } from "@/data/mock"
import { searchSongs } from "@/lib/api"

const STORAGE_KEY = "searchHistory"

/** 从 localStorage 加载历史 */
function loadHistory(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return ["周杰伦", "邓紫棋", "起风了"]
}

/** 保存历史到 localStorage */
function saveHistory(history: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
  } catch { /* ignore */ }
}

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
  history: loadHistory(),
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
    saveHistory(updated)
  },
  removeHistory: (keyword) => {
    const updated = get().history.filter((h) => h !== keyword)
    set({ history: updated })
    saveHistory(updated)
  },
  clearHistory: () => {
    set({ history: [] })
    saveHistory([])
  },
}))