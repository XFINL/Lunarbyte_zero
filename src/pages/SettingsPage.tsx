import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useUserStore } from "@/store/userStore"
import { IconArrowLeft, IconArrowRight } from "@/components/Icons"

type Section = "general" | "experimental" | "language" | "about"

interface SectionState {
  general: boolean
  experimental: boolean
  language: boolean
  about: boolean
}

const FONT_OPTIONS = [
  { value: "small" as const, label: "小" },
  { value: "normal" as const, label: "标准" },
  { value: "large" as const, label: "大" },
]

const COLOR_OPTIONS = [
  { value: "light" as const, label: "浅色" },
  { value: "dark" as const, label: "深色" },
]

const LANG_OPTIONS = [
  { value: "zh" as const, label: "中文" },
  { value: "en" as const, label: "English" },
]

export default function SettingsPage() {
  const navigate = useNavigate()
  const { settings, updateSettings } = useUserStore()
  const [open, setOpen] = useState<SectionState>({
    general: false,
    experimental: false,
    language: false,
    about: false,
  })

  const toggle = (s: Section) => {
    setOpen((prev) => ({ ...prev, [s]: !prev[s] }))
  }

  return (
    <div className="min-h-screen px-5 pt-14 pb-28 animate-fade-in">
      {/* 头部 */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-1 text-black/30 hover:text-black/60">
          <IconArrowLeft size={22} />
        </button>
        <h1 className="text-2xl font-semibold text-black">设置</h1>
      </div>

      {/* ===== 通用设置 ===== */}
      <div className="rounded-2xl bg-black/5 mb-3 overflow-hidden">
        <button
          onClick={() => toggle("general")}
          className="flex items-center justify-between w-full px-5 py-4"
        >
          <span className="text-sm font-medium text-black">通用设置</span>
          <div className={`transition-transform duration-200 ${open.general ? "rotate-90" : ""}`}>
            <IconArrowRight size={16} className="text-black/30" />
          </div>
        </button>
        {open.general && (
          <div className="px-5 pb-4 space-y-4 border-t border-black/5 pt-4">
            {/* 字体大小 */}
            <div>
              <p className="text-xs text-black/40 mb-2">字体大小</p>
              <div className="flex gap-2">
                {FONT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => updateSettings({ fontSize: opt.value })}
                    className={`px-4 py-2 rounded-xl text-xs transition-all ${
                      settings.fontSize === opt.value
                        ? "bg-black text-white"
                        : "bg-black/5 text-black/50 hover:bg-black/10"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            {/* App 配色 */}
            <div>
              <p className="text-xs text-black/40 mb-2">App 配色</p>
              <div className="flex gap-2">
                {COLOR_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => updateSettings({ colorScheme: opt.value })}
                    className={`px-4 py-2 rounded-xl text-xs transition-all ${
                      settings.colorScheme === opt.value
                        ? "bg-black text-white"
                        : "bg-black/5 text-black/50 hover:bg-black/10"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ===== 实验功能 ===== */}
      <div className="rounded-2xl bg-black/5 mb-3 overflow-hidden">
        <button
          onClick={() => toggle("experimental")}
          className="flex items-center justify-between w-full px-5 py-4"
        >
          <span className="text-sm font-medium text-black">实验功能</span>
          <div className={`transition-transform duration-200 ${open.experimental ? "rotate-90" : ""}`}>
            <IconArrowRight size={16} className="text-black/30" />
          </div>
        </button>
        {open.experimental && (
          <div className="px-5 pb-4 space-y-4 border-t border-black/5 pt-4">
            {/* 定时关闭 */}
            <div>
              <p className="text-xs text-black/40 mb-2">定时关闭</p>
              <div className="flex flex-wrap gap-2">
                {[0, 15, 30, 45, 60].map((min) => (
                  <button
                    key={min}
                    onClick={() => updateSettings({ timerMinutes: min })}
                    className={`px-4 py-2 rounded-xl text-xs transition-all ${
                      settings.timerMinutes === min
                        ? "bg-black text-white"
                        : "bg-black/5 text-black/50 hover:bg-black/10"
                    }`}
                  >
                    {min === 0 ? "关闭" : `${min} 分钟`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ===== 语言设置 ===== */}
      <div className="rounded-2xl bg-black/5 mb-3 overflow-hidden">
        <button
          onClick={() => toggle("language")}
          className="flex items-center justify-between w-full px-5 py-4"
        >
          <span className="text-sm font-medium text-black">语言设置</span>
          <div className={`transition-transform duration-200 ${open.language ? "rotate-90" : ""}`}>
            <IconArrowRight size={16} className="text-black/30" />
          </div>
        </button>
        {open.language && (
          <div className="px-5 pb-4 border-t border-black/5 pt-4">
            <div className="flex gap-2">
              {LANG_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => updateSettings({ language: opt.value })}
                  className={`px-4 py-2 rounded-xl text-xs transition-all ${
                    settings.language === opt.value
                      ? "bg-black text-white"
                      : "bg-black/5 text-black/50 hover:bg-black/10"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ===== 关于我们 ===== */}
      <div className="rounded-2xl bg-black/5 mb-3 overflow-hidden">
        <button
          onClick={() => toggle("about")}
          className="flex items-center justify-between w-full px-5 py-4"
        >
          <span className="text-sm font-medium text-black">关于我们</span>
          <div className={`transition-transform duration-200 ${open.about ? "rotate-90" : ""}`}>
            <IconArrowRight size={16} className="text-black/30" />
          </div>
        </button>
        {open.about && (
          <div className="px-5 pb-4 space-y-3 border-t border-black/5 pt-4">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-black/50">应用名称</span>
              <span className="text-sm text-black/70">Wave Music</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-black/50">版本号</span>
              <span className="text-sm text-black/70">v1.0.0</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-black/50">官网</span>
              <a
                href="https://zero.lunarbyte.pw"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-black/70 underline underline-offset-2 hover:text-black"
              >
                zero.lunarbyte.pw
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}