import { useEffect } from "react"
import { usePlayerStore } from "@/store/playerStore"
import { useUserStore } from "@/store/userStore"
import { initAudioEngine } from "@/lib/audio"

/**
 * 全局播放引擎：初始化真实音频，记录最近播放
 */
export default function PlayerEngine() {
  const { currentSong, isPlaying } = usePlayerStore()
  const { addRecentPlay } = useUserStore()

  // 初始化音频引擎（只执行一次）
  useEffect(() => {
    initAudioEngine()
  }, [])

  // 正在播放时记录到最近播放
  useEffect(() => {
    if (isPlaying && currentSong) {
      addRecentPlay(currentSong)
    }
  }, [isPlaying, currentSong, addRecentPlay])

  return null
}
