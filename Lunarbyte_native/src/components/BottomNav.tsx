import { StyleSheet, View, Text, TouchableOpacity } from "react-native"
import { useNavigation, useNavigationState } from "@react-navigation/native"
import { usePlayerStore } from "@/store/playerStore"
import { IconSearch, IconUser, IconPlay, IconPause } from "@/components/Icons"

const navItems = [
  { route: "home" as const, label: "首页", icon: null },
  { route: "search" as const, label: "搜索", icon: IconSearch },
  { route: "profile" as const, label: "我的", icon: IconUser },
]

export default function BottomNav() {
  const navigation = useNavigation<any>()
  const currentRoute = useNavigationState((state) => state?.routes[state.index]?.name)
  const { isPlaying, togglePlay } = usePlayerStore()

  // 设置页及其子页面不显示底部导航
  if (currentRoute?.startsWith("settings")) return null

  const onNavClick = (route: string) => {
    if (route === "home" && currentRoute === "home") {
      togglePlay()
    } else {
      navigation.navigate(route)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        {navItems.map((item) => {
          const isActive = currentRoute === item.route

          // 首页图标根据播放状态动态切换
          const IconComp =
            item.route === "home"
              ? isActive && isPlaying
                ? IconPause
                : IconPlay
              : item.icon

          return (
            <TouchableOpacity
              key={item.route}
              style={styles.navItem}
              onPress={() => onNavClick(item.route)}
            >
              <View style={[styles.iconWrapper, isActive && styles.iconWrapperActive]}>
                {IconComp && (
                  <IconComp size={22} color={isActive ? "#000" : "rgba(0,0,0,0.6)"} />
                )}
              </View>
              <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { position: "absolute", bottom: 24, left: 24, right: 24, elevation: 50 },
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: "rgba(255,255,255,0.75)",
    borderRadius: 200,
    paddingHorizontal: 24,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: -4 },
    elevation: 4,
  },
  navItem: { alignItems: "center", gap: 4 },
  iconWrapper: { padding: 8, borderRadius: 16 },
  iconWrapperActive: { backgroundColor: "rgba(0,0,0,0.1)" },
  navLabel: { fontSize: 10, fontWeight: "500", color: "rgba(0,0,0,0.3)" },
  navLabelActive: { color: "#000" },
})
