import { useEffect, useRef, useCallback, useState } from "react"
import { usePlayerStore } from "@/store/playerStore"
import { useUserStore } from "@/store/userStore"
import { formatTime } from "@/data/mock"

export default function HomePage() {
  const { currentSong, isPlaying, progress, next, prev, setProgress } =
    usePlayerStore()
  const { addRecentPlay } = useUserStore()
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // 滑动手势 - 只有真正滑动才切歌
  const touchStartY = useRef(0)
  const touchEndY = useRef(0)
  const hasMoved = useRef(false)
  const [swiping, setSwiping] = useState<"up" | "down" | null>(null)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY
    touchEndY.current = e.touches[0].clientY
    hasMoved.current = false
    setSwiping(null)
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndY.current = e.touches[0].clientY
    hasMoved.current = true
    const diff = touchStartY.current - touchEndY.current
    if (Math.abs(diff) > 30) {
      setSwiping(diff > 0 ? "up" : "down")
    } else {
      setSwiping(null)
    }
  }, [])

  const handleTouchEnd = useCallback(() => {
    if (!hasMoved.current) {
      setSwiping(null)
      return
    }
    const diff = touchStartY.current - touchEndY.current
    const threshold = 60
    if (diff > threshold) {
      next()
    } else if (diff < -threshold) {
      prev()
    }
    setSwiping(null)
  }, [next, prev])

  // 模拟播放进度
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setProgress(Math.min(100, progress + 0.25))
      }, 200)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isPlaying, progress, setProgress])

  useEffect(() => {
    setProgress(0)
  }, [currentSong?.id, setProgress])

  useEffect(() => {
    if (isPlaying && currentSong) {
      addRecentPlay(currentSong)
    }
  }, [isPlaying, currentSong, addRecentPlay])

  if (!currentSong) return null

  const currentDuration = Math.floor((progress / 100) * currentSong.duration)

  return (
    <div
      className="flex flex-col items-center min-h-screen px-8 pt-12 animate-fade-in relative overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 滑动提示 */}
      <div
        className={`swipe-indicator top-8 ${
          swiping === "up" ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3"
        }`}
      >
        下一首
      </div>
      <div
        className={`swipe-indicator bottom-48 ${
          swiping === "down" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
        }`}
      >
        上一首
      </div>

      {/* 专辑封面 - 方形无旋转无图标 */}
      <div className="flex items-center justify-center w-full mt-6">
        <div className="relative">
          {/* 光影 */}
          <div className="absolute inset-0 bg-black/5 rounded-2xl blur-3xl scale-110" />
          <div className="relative w-72 h-72 rounded-2xl overflow-hidden shadow-xl">
            <img
              src={currentSong.cover}
              alt={currentSong.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* 歌曲信息 */}
      <div className="w-full text-center mt-5">
        <h1 className="text-2xl font-semibold text-black tracking-tight">
          {currentSong.title}
        </h1>
        <p className="text-base text-black/40 mt-1">{currentSong.artist}</p>
      </div>

      {/* 进度条 */}
      <div className="w-full mt-5 space-y-2">
        <input
          type="range"
          min={0}
          max={100}
          value={progress}
          onChange={(e) => setProgress(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-black/30">
          <span>{formatTime(currentDuration)}</span>
          <span>{formatTime(currentSong.duration)}</span>
        </div>
      </div>
    </div>
  )
}