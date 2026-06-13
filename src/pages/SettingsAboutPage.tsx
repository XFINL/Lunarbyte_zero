import { useNavigate } from "react-router-dom"
import { IconArrowLeft } from "@/components/Icons"

export default function SettingsAboutPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen px-5 pt-14 pb-28 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate("/settings")} className="p-1 text-black/30 hover:text-black/60">
          <IconArrowLeft size={22} />
        </button>
        <h1 className="text-2xl font-semibold text-black">关于我们</h1>
      </div>

      <div className="bg-black/5 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-black/5">
          <span className="text-sm text-black/50">应用名称</span>
          <span className="text-sm text-black/70">Wave Music</span>
        </div>
        <div className="flex items-center justify-between px-5 py-4 border-b border-black/5">
          <span className="text-sm text-black/50">版本号</span>
          <span className="text-sm text-black/70">v1.0.0</span>
        </div>
        <div className="flex items-center justify-between px-5 py-4">
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
    </div>
  )
}