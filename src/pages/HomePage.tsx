import { useEffect, useRef } from "react"
import { usePlayerStore } from "@/store/playerStore"
import { useUserStore } from "@/store/userStore"
import {
  IconPlay,
  IconPause,
  IconSkipPrev,
  IconSkipNext,
  IconHeart,
  IconHeartFilled,
  IconMusic,
} from "@/components/Icons"
import { formatTime } from "@/data/mock"

export default function HomePage() {
  const {
    currentSong,
    isPlaying,
    progress,
    togglePlay,
    next,
    prev,
    setProgress,
  } = usePlayerStore()
  const { isFavorite, toggleFavorite, addRecentPlay } = useUserStore()
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const isFav = currentSong ? isFavorite(currentSong.id) : false

  // Simulate playback progress
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

  // When song changes, reset progress
  useEffect(() => {
    setProgress(0)
  }, [currentSong?.id, setProgress])

  // Add to recent plays when playing
  useEffect(() => {
    if (isPlaying && currentSong) {
      addRecentPlay(currentSong)
    }
  }, [isPlaying, currentSong, addRecentPlay])

  if (!currentSong) return null

  const currentDuration = Math.floor((progress / 100) * currentSong.duration)

  return (
    <div className="flex flex-col items-center justify-between min-h-screen px-6 pt-12 pb-28 animate-fade-in">
      {/* 顶部装饰光效 */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-white/5 rounded-full blur-[100px] pointer-events-none" />

      {/* 专辑封面 */}
      <div className="flex-1 flex items-center justify-center w-full mt-8">
        <div className="relative">
          {/* 封面光影 */}
          <div className="absolute inset-0 bg-white/10 rounded-full blur-3xl scale-110" />
          <div
            className={`relative w-72 h-72 rounded-full overflow-hidden shadow-2xl ${
              isPlaying ? "animate-spin-slow" : "animate-spin-paused"
            }`}
          >
            <img
              src={currentSong.cover}
              alt={currentSong.title}
              className="w-full h-full object-cover"
            />
          </div>
          {/* 中心装饰 */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center">
              <IconMusic size={18} className="text-white/60" />
            </div>
          </div>
        </div>
      </div>

      {/* 歌曲信息 */}
      <div className="w-full text-center mt-8">
        <h1 className="text-2xl font-semibold text-white tracking-tight">
          {currentSong.title}
        </h1>
        <p className="text-base text-white/50 mt-1">{currentSong.artist}</p>
      </div>

      {/* 进度条 */}
      <div className="w-full mt-6 space-y-2">
        <input
          type="range"
          min={0}
          max={100}
          value={progress}
          onChange={(e) => setProgress(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-white/40">
          <span>{formatTime(currentDuration)}</span>
          <span>{formatTime(currentSong.duration)}</span>
        </div>
      </div>

      {/* 控制按钮 */}
      <div className="flex items-center justify-center gap-8 mt-6">
        <button
          onClick={prev}
          className="text-white/60 hover:text-white transition-colors"
        >
          <IconSkipPrev size={28} />
        </button>

        <button
          onClick={togglePlay}
          className="w-16 h-16 rounded-full glass-strong flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
        >
          {isPlaying ? <IconPause size={30} /> : <IconPlay size={30} className="ml-1" />}
        </button>

        <button
          onClick={next}
          className="text-white/60 hover:text-white transition-colors"
        >
          <IconSkipNext size={28} />
        </button>
      </div>

      {/* 收藏按钮 */}
      <div className="mt-4">
        <button
          onClick={() => currentSong && toggleFavorite(currentSong)}
          className={`transition-all duration-300 ${
            isFav ? "text-white scale-110" : "text-white/30 hover:text-white/60"
          }`}
        >
          {isFav ? <IconHeartFilled size={24} /> : <IconHeart size={24} />}
        </button>
      </div>
    </div>
  )
}