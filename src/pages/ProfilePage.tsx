import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useUserStore } from "@/store/userStore"
import { IconUser, IconHeartFilled, IconClose, IconSearch, IconSettings, IconArrowRight } from "@/components/Icons"

export default function ProfilePage() {
  const { profile, favorites, updateName, getRemainingSearches, getDailyLimit } = useUserStore()
  const navigate = useNavigate()
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

  const remaining = getRemainingSearches()
  const dailyLimit = getDailyLimit()

  return (
    <div className="min-h-screen px-5 pt-14 pb-28 animate-fade-in">
      {/* 右上角齿轮 */}
      <button
        onClick={() => navigate("/settings")}
        className="absolute top-4 right-5 p-1.5 text-black/30 hover:text-black/60 transition-colors"
      >
        <IconSettings size={20} />
      </button>

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
        <div
          onClick={() => navigate("/favorites")}
          className="flex items-center justify-between bg-black/5 rounded-2xl p-4 cursor-pointer hover:bg-black/10 transition-colors"
        >
          <div className="flex items-center gap-3">
            <IconHeartFilled size={18} className="text-black/40" />
            <span className="text-sm font-medium text-black">点赞列表</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-black/30">
            <span>{favorites.length} 首</span>
            <IconArrowRight size={14} />
          </div>
        </div>
      </section>
    </div>
  )
}