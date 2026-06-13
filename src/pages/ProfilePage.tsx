import { useState } from "react"
import { useUserStore } from "@/store/userStore"
import { usePlayerStore } from "@/store/playerStore"
import { IconUser, IconHeart, IconHeartFilled, IconClose, IconSearch } from "@/components/Icons"

export default function ProfilePage() {
  const { profile, favorites, updateName, getRemainingSearches, getDailyLimit } = useUserStore()
  const { play, currentSong, togglePlay } = usePlayerStore()
  const [editing, setEditing] = useState(false)
  const [nameInput, setNameInput] = useState(profile.name)

  const handleSaveName = () => {
    const trimmed = nameInput.trim()
    if (trimmed) {
      updateName(trimmed)
    } else {
      setNameInput(profile.name)
    }
    setEditing(false)
  }

  const handlePlaySong = (song: (typeof favorites)[0]) => {
    if (currentSong?.id === song.id) {
      togglePlay()
    } else {
      play(song)
    }
  }

  const remaining = getRemainingSearches()
  const dailyLimit = getDailyLimit()

  return (
    <div className="min-h-screen px-5 pt-14 pb-28 animate-fade-in">
      {/* 用户信息 */}
      <div className="flex items-center gap-4 py-6">
        <div className="w-16 h-16 rounded-full bg-black/5 flex items-center justify-center shrink-0 overflow-hidden">
          {profile.avatar ? (
            <img src={profile.avatar} alt="" className="w-full h-full object-cover" />
          ) : (
            <IconUser size={28} className="text-black/30" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          {editing ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSaveName() }}
                className="flex-1 bg-black/5 rounded-xl px-3 py-2 text-base font-medium text-black outline-none"
                autoFocus
              />
              <button
                onClick={handleSaveName}
                className="text-xs text-white bg-black rounded-xl px-3 py-2"
              >
                保存
              </button>
              <button
                onClick={() => { setEditing(false); setNameInput(profile.name) }}
                className="text-black/30 hover:text-black/50"
              >
                <IconClose size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-black truncate">{profile.name}</h1>
              <button
                onClick={() => setEditing(true)}
                className="text-xs text-black/30 hover:text-black/50 shrink-0"
              >
                编辑
              </button>
            </div>
          )}
          <p className="text-sm text-black/40 mt-0.5">
            {favorites.length} 首收藏 · {profile.isVip ? "VIP" : "普通用户"}
          </p>
        </div>
      </div>

      {/* 搜索额度 */}
      <div className="bg-black/5 rounded-2xl p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <IconSearch size={16} className="text-black/40" />
            <span className="text-sm text-black/50">今日搜索额度</span>
          </div>
          <span className="text-xs text-black/30">
            {remaining} / {dailyLimit}
          </span>
        </div>
        <div className="h-2 bg-black/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-black/20 rounded-full transition-all duration-300"
            style={{ width: `${((dailyLimit - remaining) / dailyLimit) * 100}%` }}
          />
        </div>
      </div>

      {/* 点赞列表 */}
      <section>
        <h2 className="text-base font-medium text-black mb-3">点赞列表</h2>
        {favorites.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-black/20">
            <IconHeart size={40} />
            <p className="text-sm mt-3 text-black/30">还没有收藏的歌曲</p>
          </div>
        ) : (
          <div className="space-y-1">
            {favorites.map((song) => {
              const isActive = currentSong?.id === song.id
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
                    <p className="text-xs text-black/35 truncate mt-0.5">{song.artist}</p>
                  </div>
                  {isActive && <IconHeartFilled size={14} className="text-black/40 shrink-0" />}
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}