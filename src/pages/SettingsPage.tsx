import { useNavigate } from "react-router-dom"
import { IconArrowLeft, IconArrowRight } from "@/components/Icons"

const sections = [
  { path: "/settings/general", label: "通用设置", desc: "字体大小、App 配色" },
  { path: "/settings/experimental", label: "实验功能", desc: "定时关闭" },
  { path: "/settings/language", label: "语言设置", desc: "切换 App 语言" },
  { path: "/settings/about", label: "关于我们", desc: "版本信息、官网" },
]

export default function SettingsPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen px-5 pt-14 pb-28 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-1 text-black/30 hover:text-black/60">
          <IconArrowLeft size={22} />
        </button>
        <h1 className="text-2xl font-semibold text-black">设置</h1>
      </div>

      <div className="space-y-2">
        {sections.map((s) => (
          <button
            key={s.path}
            onClick={() => navigate(s.path)}
            className="flex items-center justify-between w-full bg-black/5 rounded-2xl px-5 py-4 hover:bg-black/10 transition-colors"
          >
            <div className="text-left">
              <p className="text-sm font-medium text-black">{s.label}</p>
              <p className="text-xs text-black/30 mt-0.5">{s.desc}</p>
            </div>
            <IconArrowRight size={16} className="text-black/30 shrink-0" />
          </button>
        ))}
      </div>
    </div>
  )
}