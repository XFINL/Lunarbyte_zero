import { useNavigate } from "react-router-dom"
import { useUserStore } from "@/store/userStore"
import { IconArrowLeft } from "@/components/Icons"

const TIMER_OPTIONS = [
  { value: 0, label: "关闭" },
  { value: 15, label: "15 分钟" },
  { value: 30, label: "30 分钟" },
  { value: 45, label: "45 分钟" },
  { value: 60, label: "60 分钟" },
]

export default function SettingsExperimentalPage() {
  const navigate = useNavigate()
  const { settings, updateSettings } = useUserStore()

  return (
    <div className="min-h-screen px-5 pt-14 pb-28 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate("/settings")} className="p-1 text-black/30 hover:text-black/60">
          <IconArrowLeft size={22} />
        </button>
        <h1 className="text-2xl font-semibold text-black">实验功能</h1>
      </div>

      <div className="bg-black/5 rounded-2xl p-5">
        <p className="text-sm text-black/50 mb-3">定时关闭</p>
        <p className="text-xs text-black/30 mb-4">到达设定时间后自动暂停播放</p>
        <div className="flex flex-wrap gap-2">
          {TIMER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateSettings({ timerMinutes: opt.value })}
              className={`px-4 py-2.5 rounded-xl text-sm transition-all ${
                settings.timerMinutes === opt.value
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