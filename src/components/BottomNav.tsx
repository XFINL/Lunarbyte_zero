import { useLocation, useNavigate } from "react-router-dom"
import { IconHome, IconSearch, IconUser } from "@/components/Icons"

const navItems = [
  { path: "/", label: "首页", icon: IconHome },
  { path: "/search", label: "搜索", icon: IconSearch },
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
                    ? "bg-white/15 scale-110"
                    : "bg-transparent opacity-50 hover:opacity-80"
                }`}
              >
                <item.icon
                  size={22}
                  className={isActive ? "text-white" : "text-white/80"}
                />
              </div>
              <span
                className={`text-[10px] font-medium transition-all duration-300 ${
                  isActive ? "text-white opacity-100" : "text-white/40"
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