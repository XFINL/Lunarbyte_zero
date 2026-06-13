import { useEffect, useRef } from "react"
import { usePlayerStore } from "@/store/playerStore"
import { useUserStore } from "@/store/userStore"

/**
 * 全局播放引擎：在页面切换时持续模拟进度
 */
export default function PlayerEngine() {
  const { currentSong, isPlaying, setProgress } = usePlayerStore()
  const { addRecentPlay } = useUserStore()
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // 模拟播放进度 - 按歌曲实际时长推进
  useEffect(() => {
    if (isPlaying && currentSong) {
      const increment = (100 / currentSong.duration) * 0.2 // 200ms 间隔
      intervalRef.current = setInterval(() => {
        usePlayerStore.getState().setProgress(
          Math.min(100, usePlayerStore.getState().progress + increment),
        )
      }, 200)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isPlaying, currentSong?.id, currentSong?.duration])

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