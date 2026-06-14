import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { Song } from "@/data/mock"
import { storage } from "@/lib/storage"

interface UserProfile {
  name: string
  avatar: string
  isVip: boolean
}

interface AppSettings {
  fontSize: "small" | "normal" | "large"
  colorScheme: "white" | "blue" | "lavender" | "green"
  language: "zh" | "en"
  timerMinutes: number
}

interface SearchQuota {
  count: number
  date: string
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
  canSearch: () => boolean
  consumeSearch: () => boolean
  getRemainingSearches: () => number
  getDailyLimit: () => number
}

const today = () => new Date().toISOString().slice(0, 10)

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      profile: { name: "音乐爱好者", avatar: "", isVip: false },
      favorites: [],
      recentPlays: [],
      quota: { count: 0, date: today() },
      settings: { fontSize: "normal", colorScheme: "white", language: "zh", timerMinutes: 0 },

      updateName: (name) => {
        const updated = { ...get().profile, name }
        set({ profile: updated })
      },

      updateSettings: (partial) => {
        const current = get().settings
        const updated = { ...current, ...partial }
        set({ settings: updated })
      },

      toggleFavorite: (song) => {
        const { favorites } = get()
        const exists = favorites.some((s) => s.id === song.id)
        const next = exists
          ? favorites.filter((s) => s.id !== song.id)
          : [...favorites, song]
        set({ favorites: next })
      },

      isFavorite: (songId) => get().favorites.some((s) => s.id === songId),

      addRecentPlay: (song) => {
        const { recentPlays } = get()
        const filtered = recentPlays.filter((s) => s.id !== song.id)
        const next = [song, ...filtered].slice(0, 20)
        set({ recentPlays: next })
      },

      canSearch: () => {
        const { quota, profile } = get()
        const todayDate = today()
        if (quota.date !== todayDate) return true
        const max = profile.isVip ? 100 : 12
        return quota.count < max
      },

      consumeSearch: () => {
        const { quota, profile } = get()
        const todayDate = today()
        const max = profile.isVip ? 100 : 12
        if (quota.date !== todayDate) {
          set({ quota: { count: 1, date: todayDate } })
          return true
        }
        if (quota.count >= max) return false
        const updated = { count: quota.count + 1, date: quota.date }
        set({ quota: updated })
        return true
      },

      getRemainingSearches: () => {
        const { quota, profile } = get()
        const todayDate = today()
        const max = profile.isVip ? 100 : 12
        if (quota.date !== todayDate) return max
        return Math.max(0, max - quota.count)
      },

      getDailyLimit: () => {
        return get().profile.isVip ? 100 : 12
      },
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => storage),
    }
  )
)
