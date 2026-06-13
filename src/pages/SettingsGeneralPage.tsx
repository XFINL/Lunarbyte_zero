import { useNavigate } from "react-router-dom"
import { useUserStore } from "@/store/userStore"
import { IconArrowLeft } from "@/components/Icons"

const FONT_OPTIONS = [
  { value: "small" as const, label: "小" },
  { value: "normal" as const, label: "标准" },
  { value: "large" as const, label: "大" },
]

const COLOR_OPTIONS = [
  { value: "white" as const, label: "白", color: "#ffffff" },
  { value: "blue" as const, label: "淡蓝", color: "#e8f4fd" },
  { value: "lavender" as const, label: "薰衣草", color: "#f3e8ff" },
  { value: "green" as const, label: "浅绿", color: "#ecfdf5" },
]

export default function SettingsGeneralPage() {
  const navigate = useNavigate()
  const { settings, updateSettings } = useUserStore()

  return (
    <div className="min-h-screen px-5 pt-14 pb-28 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-1 text-black/30 hover:text-black/60">
          <IconArrowLeft size={22} />
        </button>
        <h1 className="text-2xl font-semibold text-black">通用设置</h1>
      </div>

      {/* 字体大小 */}
      <div className="bg-black/5 rounded-2xl p-5 mb-4">
        <p className="text-sm text-black/50 mb-3">字体大小</p>
        <div className="flex gap-2">
          {FONT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateSettings({ fontSize: opt.value })}
              className={`flex-1 py-3 rounded-xl text-sm transition-all ${
                settings.fontSize === opt.value
                  ? "bg-black text-white"
                  : "bg-white/50 text-black/50 hover:bg-white/80"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* App 配色 */}
      <div className="bg-black/5 rounded-2xl p-5">
        <p className="text-sm text-black/50 mb-3">App 配色</p>
        <div className="flex gap-2">
          {COLOR_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateSettings({ colorScheme: opt.value })}
              className={`flex-1 py-3 rounded-xl text-sm transition-all flex flex-col items-center gap-1.5 ${
                settings.colorScheme === opt.value
                  ? "bg-black text-white"
                  : "bg-white/50 text-black/50 hover:bg-white/80"
              }`}
            >
              <span
                className="w-5 h-5 rounded-full border border-black/10"
                style={{ background: opt.color }}
              />
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}