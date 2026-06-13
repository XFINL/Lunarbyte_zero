import { useLocation, useNavigate } from "react-router-dom"
import { usePlayerStore } from "@/store/playerStore"
import { IconSearch, IconUser, IconPlay, IconPause } from "@/components/Icons"

const navItems = [
  { path: "/search", label: "搜索", icon: IconSearch },
  { path: "/", label: "首页", icon: null }, // home 用动态图标
  { path: "/profile", label: "我的", icon: IconUser },
]

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const { isPlaying, togglePlay } = usePlayerStore()

  // 设置页不显示底部导航
  if (location.pathname === "/settings") return null

  const onNavClick = (path: string) => {
    if (path === "/" && location.pathname === "/") {
      // 已在首页时点击切换播放/暂停
      togglePlay()
    } else {
      navigate(path)
    }
  }

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-48px)] max-w-md">
      <div className="glass-nav rounded-[200px] px-6 py-3 flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path

          // 首页图标根据播放状态动态切换
          const IconComp =
            item.path === "/"
              ? isActive && isPlaying
                ? IconPause
                : IconPlay
              : item.icon

          return (
            <button
              key={item.path}
              onClick={() => onNavClick(item.path)}
              className="flex flex-col items-center gap-1 transition-all duration-300 relative"
            >
              <div
                className={`p-2 rounded-2xl transition-all duration-300 ${
                  isActive
                    ? "bg-black/10 scale-110"
                    : "bg-transparent opacity-40 hover:opacity-70"
                }`}
              >
                {IconComp && (
                  <IconComp
                    size={22}
                    className={isActive ? "text-black" : "text-black/60"}
                  />
                )}
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