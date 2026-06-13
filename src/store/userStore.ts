import { create } from "zustand"
import type { Song } from "@/data/mock"

const USER_KEY = "userProfile"
const QUOTA_KEY = "searchQuota"
const SETTINGS_KEY = "appSettings"
const FAVORITES_KEY = "favorites"
const RECENT_KEY = "recentPlays"

interface UserProfile {
  name: string
  avatar: string
  isVip: boolean
}

interface AppSettings {
  fontSize: "small" | "normal" | "large"
  colorScheme: "white" | "blue" | "lavender" | "green"
  language: "zh" | "en"
  timerMinutes: number // 定时关闭分钟数，0=关闭
}

interface SearchQuota {
  count: number
  date: string // YYYY-MM-DD
}

function loadProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(USER_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return { name: "音乐爱好者", avatar: "", isVip: false }
}

function saveProfile(p: UserProfile) {
  try { localStorage.setItem(USER_KEY, JSON.stringify(p)) } catch { /* ignore */ }
}

function loadQuota(): SearchQuota {
  try {
    const raw = localStorage.getItem(QUOTA_KEY)
    if (raw) {
      const q: SearchQuota = JSON.parse(raw)
      const today = new Date().toISOString().slice(0, 10)
      if (q.date === today) return q
    }
  } catch { /* ignore */ }
  return { count: 0, date: new Date().toISOString().slice(0, 10) }
}

function saveQuota(q: SearchQuota) {
  try { localStorage.setItem(QUOTA_KEY, JSON.stringify(q)) } catch { /* ignore */ }
}

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return { fontSize: "normal", colorScheme: "white", language: "zh", timerMinutes: 0 }
}

function saveSettings(s: AppSettings) {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)) } catch { /* ignore */ }
}

function loadFavorites(): Song[] {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return []
}
function saveFavorites(f: Song[]) {
  try { localStorage.setItem(FAVORITES_KEY, JSON.stringify(f)) } catch { /* ignore */ }
}

function loadRecentPlays(): Song[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return []
}
function saveRecentPlays(r: Song[]) {
  try { localStorage.setItem(RECENT_KEY, JSON.stringify(r)) } catch { /* ignore */ }
}

interface UserState {
  profile: UserProfile
  favorites: Song[]
  recentPlays: Song[]
  quota: SearchQuota
  settings: AppSettings
  updateName: (name: string) => void
  updateSettings: (s: Partial<AppSettings>) => void
  toggleFavorite: (song: Song) => void
  isFavorite: (songId: string) => boolean
  addRecentPlay: (song: Song) => void
  /** 检查当前是否还能搜索 */
  canSearch: () => boolean
  /** 消耗一次搜索次数，返回是否成功 */
  consumeSearch: () => boolean
  /** 获取剩余搜索次数 */
  getRemainingSearches: () => number
  /** 获取每日总上限 */
  getDailyLimit: () => number
}

export const useUserStore = create<UserState>((set, get) => ({
  profile: loadProfile(),
  favorites: loadFavorites(),
  recentPlays: loadRecentPlays(),
  quota: loadQuota(),
  settings: loadSettings(),

  updateName: (name) => {
    const updated = { ...get().profile, name }
    set({ profile: updated })
    saveProfile(updated)
  },

  updateSettings: (partial) => {
    const current = get().settings
    const updated = { ...current, ...partial }
    set({ settings: updated })
    saveSettings(updated)
  },

  toggleFavorite: (song) => {
    const { favorites } = get()
    const exists = favorites.some((s) => s.id === song.id)
    let next: Song[]
    if (exists) {
      next = favorites.filter((s) => s.id !== song.id)
    } else {
      next = [...favorites, song]
    }
    set({ favorites: next })
    saveFavorites(next)
  },

  isFavorite: (songId) => get().favorites.some((s) => s.id === songId),

  addRecentPlay: (song) => {
    const { recentPlays } = get()
    const filtered = recentPlays.filter((s) => s.id !== song.id)
    const next = [song, ...filtered].slice(0, 20)
    set({ recentPlays: next })
    saveRecentPlays(next)
  },

  canSearch: () => {
    const { quota, profile } = get()
    const max = profile.isVip ? 100 : 12
    return quota.count < max
  },

  consumeSearch: () => {
    const { quota, profile } = get()
    const max = profile.isVip ? 100 : 12
    if (quota.count >= max) return false
    const updated = { count: quota.count + 1, date: quota.date }
    set({ quota: updated })
    saveQuota(updated)
    return true
  },

  getRemainingSearches: () => {
    const { quota, profile } = get()
    const max = profile.isVip ? 100 : 12
    return Math.max(0, max - quota.count)
  },

  getDailyLimit: () => {
    return get().profile.isVip ? 100 : 12
  },
}))