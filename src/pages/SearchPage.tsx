import { useState, useCallback } from "react"
import { useSearchStore } from "@/store/searchStore"
import { usePlayerStore } from "@/store/playerStore"
import { useUserStore } from "@/store/userStore"
import { IconSearch, IconClose, IconHeart, IconHeartFilled } from "@/components/Icons"
import type { Song } from "@/data/mock"

export default function SearchPage() {
  const { query, setQuery, results, history, search, removeHistory, clearHistory } =
    useSearchStore()
  const { play, currentSong, isPlaying, togglePlay } = usePlayerStore()
  const { isFavorite, toggleFavorite } = useUserStore()
  const [focused, setFocused] = useState(false)

  const handleSearch = useCallback(
    (q: string) => {
      setQuery(q)
      search(q)
    },
    [setQuery, search],
  )

  const handlePlaySong = (song: Song) => {
    if (currentSong?.id === song.id) {
      togglePlay()
    } else {
      play(song)
    }
  }

  return (
    <div className="min-h-screen px-5 pt-14 pb-28 animate-fade-in">
      {/* 标题 */}
      <h1 className="text-2xl font-semibold text-black mb-5">搜索</h1>

      {/* 搜索框 */}
      <div
        className={`flex items-center gap-3 glass rounded-2xl px-4 py-3 transition-all duration-300 ${
          focused ? "ring-1 ring-black/10" : ""
        }`}
      >
        <IconSearch size={18} className="text-black/30 shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="搜索歌曲、歌手..."
          className="flex-1 bg-transparent text-black placeholder-black/25 text-sm outline-none"
        />
        {query && (
          <button onClick={() => handleSearch("")} className="text-black/20 hover:text-black/50">
            <IconClose size={16} />
          </button>
        )}
      </div>

      {/* 搜索历史 */}
      {!query && history.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-black/40">搜索历史</span>
            <button
              onClick={clearHistory}
              className="text-xs text-black/20 hover:text-black/50"
            >
              清空
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {history.map((keyword) => (
              <span
                key={keyword}
                onClick={() => handleSearch(keyword)}
                className="glass rounded-xl px-4 py-2 text-sm text-black/60 cursor-pointer hover:bg-black/5 transition-colors"
              >
                {keyword}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    removeHistory(keyword)
                  }}
                  className="ml-2 text-black/15 hover:text-black/40 align-middle"
                >
                  <IconClose size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 搜索结果 */}
      {query && (
        <div className="mt-6 space-y-1">
          <p className="text-sm text-black/30 mb-3">
            找到 {results.length} 首歌曲
          </p>
          {results.map((song) => {
            const isActive = currentSong?.id === song.id
            const isFav = isFavorite(song.id)
            return (
              <div
                key={song.id}
                onClick={() => handlePlaySong(song)}
                className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all duration-200 ${
                  isActive
                    ? "glass-strong"
                    : "hover:bg-black/3"
                }`}
              >
                <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 bg-black/5">
                  <img
                    src={song.cover}
                    alt={song.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium truncate ${
                      isActive ? "text-black" : "text-black/70"
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
                  {isFav ? <IconHeartFilled size={18} /> : <IconHeart size={18} />}
                </button>
              </div>
            )
          })}
          {results.length === 0 && query && (
            <div className="text-center py-12 text-black/25 text-sm">
              未找到相关歌曲
            </div>
          )}
        </div>
      )}
    </div>
  )
}