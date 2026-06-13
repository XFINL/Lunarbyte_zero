import { useNavigate } from "react-router-dom"
import { useUserStore } from "@/store/userStore"
import { IconArrowLeft } from "@/components/Icons"

const LANG_OPTIONS = [
  { value: "zh" as const, label: "中文" },
  { value: "en" as const, label: "English" },
]

export default function SettingsLanguagePage() {
  const navigate = useNavigate()
  const { settings, updateSettings } = useUserStore()

  return (
    <div className="min-h-screen px-5 pt-14 pb-28 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate("/settings")} className="p-1 text-black/30 hover:text-black/60">
          <IconArrowLeft size={22} />
        </button>
        <h1 className="text-2xl font-semibold text-black">语言设置</h1>
      </div>

      <div className="bg-black/5 rounded-2xl p-5">
        <p className="text-sm text-black/50 mb-3">选择 App 显示语言</p>
        <div className="flex gap-2">
          {LANG_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateSettings({ language: opt.value })}
              className={`flex-1 py-3 rounded-xl text-sm transition-all ${
                settings.language === opt.value
                  ? "bg-black text-white"
                  : "bg-white/50 text-black/50 hover:bg-white/80"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}