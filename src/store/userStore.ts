import { create } from "zustand"
import type { Song } from "@/data/mock"

const USER_KEY = "userProfile"
const QUOTA_KEY = "searchQuota"

interface UserProfile {
  name: string
  avatar: string
  isVip: boolean
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
      // 检查是否同一天，不是则重置
      const today = new Date().toISOString().slice(0, 10)
      if (q.date === today) return q
    }
  } catch { /* ignore */ }
  return { count: 0, date: new Date().toISOString().slice(0, 10) }
}

function saveQuota(q: SearchQuota) {
  try { localStorage.setItem(QUOTA_KEY, JSON.stringify(q)) } catch { /* ignore */ }
}

interface UserState {
  profile: UserProfile
  favorites: Song[]
  recentPlays: Song[]
  quota: SearchQuota
  updateName: (name: string) => void
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
  favorites: [],
  recentPlays: [],
  quota: loadQuota(),

  updateName: (name) => {
    const updated = { ...get().profile, name }
    set({ profile: updated })
    saveProfile(updated)
  },

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