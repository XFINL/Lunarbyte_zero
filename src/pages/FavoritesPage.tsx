import { useState } from "react"
import { useUserStore } from "@/store/userStore"
import { usePlayerStore } from "@/store/playerStore"
import { IconHeartFilled, IconArrowLeft, IconArrowRight } from "@/components/Icons"

const PAGE_SIZE = 7

export default function FavoritesPage() {
  const { favorites } = useUserStore()
  const { play, currentSong, togglePlay } = usePlayerStore()
  const [page, setPage] = useState(0)

  const totalPages = Math.max(1, Math.ceil(favorites.length / PAGE_SIZE))
  const start = page * PAGE_SIZE
  const visible = favorites.slice(start, start + PAGE_SIZE)

  const handlePlaySong = (song: (typeof favorites)[0]) => {
    if (currentSong?.id === song.id) {
      togglePlay()
    } else {
      play(song)
    }
  }

  return (
    <div className="min-h-screen px-5 pt-14 pb-28 animate-fade-in">
      <h1 className="text-2xl font-semibold text-black mb-5">点赞列表</h1>

      {favorites.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-black/20">
          <IconHeartFilled size={48} />
          <p className="text-sm mt-4 text-black/30">还没有收藏的歌曲</p>
        </div>
      ) : (
        <>
          <div className="space-y-1">
            {visible.map((song) => {
              const isActive = currentSong?.id === song.id
              return (
                <div
                  key={song.id}
                  onClick={() => handlePlaySong(song)}
                  className="flex items-center gap-3 py-3 cursor-pointer border-b border-black/5"
                >
                  <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-black/5">
                    <img src={song.cover} alt={song.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm truncate ${isActive ? "text-black font-medium" : "text-black/70"}`}>
                      {song.title}
                    </p>
                    <p className="text-xs text-black/35 truncate mt-0.5">{song.artist}</p>
                  </div>
                  {isActive && <IconHeartFilled size={14} className="text-black/40 shrink-0" />}
                </div>
              )
            })}
          </div>

          {/* 翻页 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-6">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="p-2 rounded-xl text-black/30 hover:text-black/60 disabled:opacity-20 disabled:cursor-not-allowed"
              >
                <IconArrowLeft size={18} />
              </button>
              <span className="text-sm text-black/40">
                {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                className="p-2 rounded-xl text-black/30 hover:text-black/60 disabled:opacity-20 disabled:cursor-not-allowed"
              >
                <IconArrowRight size={18} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}