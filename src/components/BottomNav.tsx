import { useLocation, useNavigate } from "react-router-dom"
import { IconSearch, IconUser } from "@/components/Icons"

/* 首页用播放图标 */
function IconPlayer({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 8v8l6-4-6-4z" fill="currentColor" />
    </svg>
  )
}

const navItems = [
  { path: "/search", label: "搜索", icon: IconSearch },
  { path: "/", label: "首页", icon: IconPlayer },
  { path: "/profile", label: "我的", icon: IconUser },
]

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-48px)] max-w-md">
      <div className="glass-nav rounded-3xl px-6 py-3 flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center gap-1 transition-all duration-300 relative"
            >
              <div
                className={`p-2 rounded-2xl transition-all duration-300 ${
                  isActive
                    ? "bg-black/10 scale-110"
                    : "bg-transparent opacity-40 hover:opacity-70"
                }`}
              >
                <item.icon
                  size={22}
                  className={isActive ? "text-black" : "text-black/60"}
                />
              </div>
              <span
                className={`text-[10px] font-medium transition-all duration-300 ${
                  isActive ? "text-black" : "text-black/30"
                }`}
              >
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}