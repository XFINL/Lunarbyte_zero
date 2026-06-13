import { useState } from "react"
import { useUserStore } from "@/store/userStore"
import { IconClose } from "@/components/Icons"
import { useNavigate } from "react-router-dom"

export default function SettingsPage() {
  const { profile, updateName } = useUserStore()
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [nameInput, setNameInput] = useState(profile.name)

  const handleSave = () => {
    if (nameInput.trim()) {
      updateName(nameInput.trim())
    } else {
      setNameInput(profile.name)
    }
    setEditing(false)
  }

  return (
    <div className="min-h-screen px-5 pt-14 pb-28 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-black">设置</h1>
        <button onClick={() => navigate(-1)} className="text-black/30 hover:text-black/60">
          <IconClose size={20} />
        </button>
      </div>

      {/* 用户信息 */}
      <section className="mb-6">
        <h2 className="text-sm text-black/40 mb-3">用户信息</h2>
        <div className="bg-black/5 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-black/10 flex items-center justify-center shrink-0">
              <span className="text-sm text-black/40 font-medium">
                {(profile.name[0] || "?").toUpperCase()}
              </span>
            </div>
            {editing ? (
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSave() }}
                  className="flex-1 bg-white rounded-xl px-3 py-2 text-sm text-black outline-none border border-black/10"
                  autoFocus
                />
                <button onClick={handleSave} className="text-xs text-white bg-black rounded-xl px-3 py-2">
                  保存
                </button>
                <button onClick={() => { setEditing(false); setNameInput(profile.name) }} className="text-black/30 hover:text-black/50">
                  <IconClose size={14} />
                </button>
              </div>
            ) : (
              <div className="flex-1 flex items-center gap-2">
                <span className="text-sm font-medium text-black">{profile.name}</span>
                <button onClick={() => setEditing(true)} className="text-xs text-black/30 hover:text-black/50">
                  编辑
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 账户类型 */}
      <section className="mb-6">
        <h2 className="text-sm text-black/40 mb-3">账户</h2>
        <div className="bg-black/5 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-black/70">账户类型</span>
            <span className="text-sm font-medium text-black">{profile.isVip ? "VIP 用户" : "普通用户"}</span>
          </div>
          {!profile.isVip && (
            <p className="text-xs text-black/30 mt-2">
              普通用户每日搜索上限 12 次，升级 VIP 可获得 100 次 / 天
            </p>
          )}
        </div>
      </section>
    </div>
  )
}