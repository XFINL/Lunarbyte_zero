import { useEffect, useRef } from "react"
import { usePlayerStore } from "@/store/playerStore"
import { useUserStore } from "@/store/userStore"

/**
 * 全局播放引擎：在页面切换时持续模拟进度
 */
export default function PlayerEngine() {
  const { currentSong, isPlaying, progress, setProgress } = usePlayerStore()
  const { addRecentPlay } = useUserStore()
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // 模拟播放进度
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        usePlayerStore.getState().setProgress(Math.min(100, usePlayerStore.getState().progress + 0.25))
      }, 200)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isPlaying])

  // 切歌时重置进度
  useEffect(() => {
    setProgress(0)
  }, [currentSong?.id, setProgress])

  // 正在播放时记录到最近播放
  useEffect(() => {
    if (isPlaying && currentSong) {
      addRecentPlay(currentSong)
    }
  }, [isPlaying, currentSong, addRecentPlay])

  return null
}