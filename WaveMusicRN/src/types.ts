export interface Song {
  id: string
  title: string
  artist: string
  cover: string
  duration: number
  album: string
  url?: string
}

export interface UserProfile {
  name: string
  avatar: string
  isVip: boolean
}

export interface AppSettings {
  fontSize: "small" | "normal" | "large"
  colorScheme: "white" | "blue" | "lavender" | "green"
  language: "zh" | "en"
  timerMinutes: number
}

export interface SearchQuota {
  count: number
  date: string
}

export const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, "0")}`
}