import { useState, useCallback, useRef, useEffect } from "react"
import { useSearchStore } from "@/store/searchStore"
import { usePlayerStore } from "@/store/playerStore"
import { useUserStore } from "@/store/userStore"
import { IconSearch, IconClose, IconHeart, IconHeartFilled } from "@/components/Icons"
import type { Song } from "@/data/mock"

export default function SearchPage() {
  const { query, setQuery, results, history, search, removeHistory, clearHistory, loading } =
    useSearchStore()
  const { play, currentSong, togglePlay } = usePlayerStore()
  const { isFavorite, toggleFavorite } = useUserStore()
  const [confirmDeleteTag, setConfirmDeleteTag] = useState<string | null>(null)
  const [confirmClearAll, setConfirmClearAll] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Toast 1s 自动消失
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 1000)
      return () => clearTimeout(t)
    }
  }, [toast])

  const handleSearch = useCallback(
    async (q: string) => {
      setQuery(q)
      await search(q)
    },
    [setQuery, search],
  )

  const handleSearchClick = useCallback(async () => {
    if (query.trim()) {
      await search(query)
    }
  }, [query, search])

  const handleInputChange = useCallback(
    (value: string) => {
      setQuery(value)
      if (!value.trim()) {
        search("")
      }
    },
    [setQuery, search],
  )

  const handlePlaySong = (song: Song) => {
    if (currentSong?.id === song.id) {
      togglePlay()
    } else {
      play(song)
    }
    setToast(song.title)
  }

  // 长按标签
  const handleTagTouchStart = (keyword: string) => {
    longPressTimer.current = setTimeout(() => {
      setConfirmDeleteTag(keyword)
    }, 500)
  }

  const handleTagTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }

  const handleConfirmDeleteTag = () => {
    if (confirmDeleteTag) {
      removeHistory(confirmDeleteTag)
    }
    setConfirmDeleteTag(null)
  }

  const handleConfirmClearAll = () => {
    clearHistory()
    setConfirmClearAll(false)
  }

  return (
    <div className="min-h-screen px-5 pt-14 pb-28 animate-fade-in">
      {/* 左上角 Toast */}
      {toast && (
        <div className="fixed top-4 left-4 z-50 glass rounded-2xl px-4 py-2.5 animate-fade-in">
          <span className="text-sm text-black/70">
            已添加「<span className="text-black font-medium">{toast}</span>」
          </span>
        </div>
      )}

      {/* 确认弹窗 - 删除单个标签 */}
      {confirmDeleteTag && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 mx-5 max-w-xs w-full shadow-xl border border-black/5">
            <p className="text-sm text-center text-black/70">
              是否删除搜索词「<span className="text-black font-medium">{confirmDeleteTag}</span>」？
            </p>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setConfirmDeleteTag(null)}
                className="flex-1 bg-black/5 rounded-2xl py-2.5 text-sm text-black/50"
              >
                取消
              </button>
              <button
                onClick={handleConfirmDeleteTag}
                className="flex-1 bg-black rounded-2xl py-2.5 text-sm text-white"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 确认弹窗 - 清空全部 */}
      {confirmClearAll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 mx-5 max-w-xs w-full shadow-xl border border-black/5">
            <p className="text-sm text-center text-black/70">
              确定要清空所有搜索历史吗？
            </p>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setConfirmClearAll(false)}
                className="flex-1 bg-black/5 rounded-2xl py-2.5 text-sm text-black/50"
              >
                取消
              </button>
              <button
                onClick={handleConfirmClearAll}
                className="flex-1 bg-black rounded-2xl py-2.5 text-sm text-white"
              >
                清空
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 标题 */}
      <h1 className="text-2xl font-semibold text-black mb-5">搜索</h1>

      {/* 搜索框 - 放大镜内嵌 */}
      <div className="relative">
        <IconSearch
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-black/25 pointer-events-none"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleSearchClick() }}
          placeholder="搜索歌曲、歌手..."
          className="w-full bg-black/5 rounded-2xl pl-11 pr-20 py-3 text-sm text-black placeholder-black/25 outline-none"
        />
        {query && (
          <button
            onClick={() => handleInputChange("")}
            className="absolute right-10 top-1/2 -translate-y-1/2 text-black/20 hover:text-black/50"
          >
            <IconClose size={16} />
          </button>
        )}
        <button
          onClick={handleSearchClick}
          disabled={loading}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-black/30 hover:text-black/60 transition-colors disabled:opacity-30"
        >
          <IconSearch size={18} />
        </button>
      </div>

      {/* 搜索历史 */}
      {!query && history.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-black/40">搜索历史</span>
            <button
              onClick={() => setConfirmClearAll(true)}
              className="text-xs text-black/20 hover:text-black/50"
            >
              全部删除
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {history.map((keyword) => (
              <span
                key={keyword}
                onClick={() => handleSearch(keyword)}
                onTouchStart={() => handleTagTouchStart(keyword)}
                onTouchEnd={handleTagTouchEnd}
                onContextMenu={(e) => {
                  e.preventDefault()
                  setConfirmDeleteTag(keyword)
                }}
                className="bg-black/5 rounded-xl px-4 py-2 text-sm text-black/60 cursor-pointer hover:bg-black/10 transition-colors select-none"
              >
                {keyword}
              </span>
            ))}
          </div>
          <p className="text-xs text-black/15 mt-2">长按标签可删除</p>
        </div>
      )}

      {/* 搜索结果 - 纯扁平列表 */}
      {query && (
        <div className="mt-5">
          <p className="text-sm text-black/30 mb-2">
            找到 {results.length} 首歌曲
          </p>
          {results.map((song) => {
            const isActive = currentSong?.id === song.id
            const isFav = isFavorite(song.id)
            return (
              <div
                key={song.id}
                onClick={() => handlePlaySong(song)}
                className="flex items-center gap-3 py-3 cursor-pointer border-b border-black/5"
              >
                <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-black/5">
                  <img
                    src={song.cover}
                    alt={song.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm truncate ${
                      isActive ? "text-black font-medium" : "text-black/70"
                    }`}
                  >
                    {song.title}
                  </p>
                  <p className="text-xs text-black/35 truncate mt-0.5">
                    {song.artist}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleFavorite(song)
                  }}
                  className={`shrink-0 transition-colors ${
                    isFav ? "text-black" : "text-black/20 hover:text-black/50"
                  }`}
                >
                  {isFav ? <IconHeartFilled size={16} /> : <IconHeart size={16} />}
                </button>
              </div>
            )
          })}
          {loading && (
            <div className="text-center py-12 text-black/25 text-sm">
              搜索中...
            </div>
          )}
          {!loading && results.length === 0 && (
            <div className="text-center py-12 text-black/25 text-sm">
              未找到相关歌曲
            </div>
          )}
        </div>
      )}
    </div>
  )
}