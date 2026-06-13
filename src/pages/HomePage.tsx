import { useCallback, useRef, useState, useEffect } from "react"
import { usePlayerStore } from "@/store/playerStore"
import { formatTime } from "@/data/mock"
import { IconList, IconClose, IconMusic, IconPlay } from "@/components/Icons"

export default function HomePage() {
  const {
    currentSong, isPlaying, progress, playlist,
    next, prev, setProgress, removeFromPlaylist, clearPlaylist, play, resumeFromPlaylist,
  } = usePlayerStore()

  // 挂载时如果 currentSong 为空但 playlist 有歌，自动播第一首
  useEffect(() => {
    resumeFromPlaylist()
  }, [resumeFromPlaylist])

  // 滑动手势
  const touchStartY = useRef(0)
  const touchEndY = useRef(0)
  const hasMoved = useRef(false)
  const isDraggingSlider = useRef(false)
  const [swiping, setSwiping] = useState<"up" | "down" | null>(null)

  // 播放列表弹窗
  const [showPlaylist, setShowPlaylist] = useState(false)
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null)
  const [confirmClearAll, setConfirmClearAll] = useState(false)
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if ((e.target as HTMLElement).tagName === "INPUT") {
      isDraggingSlider.current = true
      return
    }
    isDraggingSlider.current = false
    touchStartY.current = e.touches[0].clientY
    touchEndY.current = e.touches[0].clientY
    hasMoved.current = false
    setSwiping(null)
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (isDraggingSlider.current) return
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
    if (isDraggingSlider.current) {
      isDraggingSlider.current = false
      return
    }
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

  // 长按播放列表项
  const handleItemTouchStart = (songId: string) => {
    longPressTimer.current = setTimeout(() => {
      setConfirmRemove(songId)
    }, 500)
  }
  const handleItemTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }

  // 用 playlist 决定显示空状态还是播放器，不依赖 currentSong
  if (playlist.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen animate-fade-in px-8">
        <div className="flex flex-col items-center gap-4 text-black/20">
          <IconMusic size={56} />
          <p className="text-base text-black/30">请添加音乐再来吧</p>
        </div>
      </div>
    )
  }

  // currentSong 可能在第一次渲染时还没设置，用 playlist[0] 兜底
  const displaySong = currentSong ?? playlist[0]
  const currentDuration = Math.floor((progress / 100) * displaySong.duration)

  return (
    <div
      className="flex flex-col items-center min-h-screen px-8 pt-12 animate-fade-in relative overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 播放列表展开按钮 - 左上角 */}
      <button
        onClick={() => setShowPlaylist(true)}
        className="absolute top-4 left-4 p-2 text-black/40 hover:text-black/70 transition-colors z-10"
      >
        <IconList size={22} />
      </button>

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

      {/* 专辑封面 */}
      <div className="flex items-center justify-center w-full mt-6">
        <div className="relative">
          <div className="absolute inset-0 bg-black/5 rounded-2xl blur-3xl scale-110" />
          <div className="relative w-72 h-72 rounded-2xl overflow-hidden shadow-xl">
            <img
              src={displaySong.cover}
              alt={displaySong.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* 歌曲信息 */}
      <div className="w-full text-center mt-5">
        <h1 className="text-2xl font-semibold text-black tracking-tight">
          {displaySong.title}
        </h1>
        <p className="text-base text-black/40 mt-1">{displaySong.artist}</p>
      </div>

      {/* 进度条 */}
      <div className="w-full mt-5">
        <input
          type="range"
          min={0}
          max={100}
          value={progress}
          onChange={(e) => setProgress(Number(e.target.value))}
          style={{ "--progress": `${progress}%` } as React.CSSProperties}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-black/30 mt-2 px-1">
          <span>{formatTime(currentDuration)}</span>
          <span>{formatTime(displaySong.duration)}</span>
        </div>
      </div>

      {/* ===== 播放列表弹窗 ===== */}
      {showPlaylist && (
        <div className="fixed inset-0 z-50 flex flex-col">
          {/* 半透明背景 */}
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setShowPlaylist(false)}
          />
          {/* 从上往下滑出的面板 */}
          <div className="relative bg-white rounded-b-3xl shadow-xl animate-slide-down max-h-[70vh] flex flex-col">
            {/* 头部 */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <h2 className="text-base font-semibold text-black">
                播放列表（{playlist.length}）
              </h2>
              <div className="flex items-center gap-3">
                {playlist.length > 0 && (
                  <button
                    onClick={() => setConfirmClearAll(true)}
                    className="text-xs text-black/30 hover:text-black/60 transition-colors"
                  >
                    全部移除
                  </button>
                )}
                <button
                  onClick={() => setShowPlaylist(false)}
                  className="text-black/30 hover:text-black/60 transition-colors"
                >
                  <IconClose size={18} />
                </button>
              </div>
            </div>
            {/* 列表 */}
            <div className="overflow-y-auto px-5 pb-5 flex-1">
              {playlist.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-black/20">
                  <IconMusic size={40} />
                  <p className="text-sm mt-3">播放列表为空</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {playlist.map((song) => {
                    const isActive = currentSong?.id === song.id
                    return (
                      <div
                        key={song.id}
                        onClick={() => {
                          play(song)
                          setShowPlaylist(false)
                        }}
                        onTouchStart={() => handleItemTouchStart(song.id)}
                        onTouchEnd={handleItemTouchEnd}
                        onContextMenu={(e) => {
                          e.preventDefault()
                          setConfirmRemove(song.id)
                        }}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors select-none ${
                          isActive ? "bg-black/5" : "hover:bg-black/3"
                        }`}
                      >
                        <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 bg-black/5">
                          <img src={song.cover} alt={song.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${isActive ? "text-black" : "text-black/70"}`}>
                            {song.title}
                          </p>
                          <p className="text-xs text-black/35 truncate">{song.artist}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 确认弹窗 - 移除单曲 */}
      {confirmRemove && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 mx-5 max-w-xs w-full shadow-xl border border-black/5">
            <p className="text-sm text-center text-black/70">
              是否从播放列表中移除该歌曲？
            </p>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setConfirmRemove(null)}
                className="flex-1 bg-black/5 rounded-2xl py-2.5 text-sm text-black/50"
              >
                取消
              </button>
              <button
                onClick={() => {
                  removeFromPlaylist(confirmRemove)
                  setConfirmRemove(null)
                }}
                className="flex-1 bg-black rounded-2xl py-2.5 text-sm text-white"
              >
                移除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 确认弹窗 - 全部移除 */}
      {confirmClearAll && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 mx-5 max-w-xs w-full shadow-xl border border-black/5">
            <p className="text-sm text-center text-black/70">
              确定要清空播放列表吗？
            </p>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setConfirmClearAll(false)}
                className="flex-1 bg-black/5 rounded-2xl py-2.5 text-sm text-black/50"
              >
                取消
              </button>
              <button
                onClick={() => {
                  clearPlaylist()
                  setConfirmClearAll(false)
                  setShowPlaylist(false)
                }}
                className="flex-1 bg-black rounded-2xl py-2.5 text-sm text-white"
              >
                清空
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}