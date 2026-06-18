import React from "react"
import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs"
import { usePlayerStore } from "@/store/playerStore"
import { IconSearch, IconUser, IconPlay, IconPause } from "@/components/Icons"

const TAB_ICONS = {
  Home: null,
  Search: IconSearch,
  Profile: IconUser,
} as const

const TAB_LABELS = {
  Home: "首页",
  Search: "搜索",
  Profile: "我的",
} as const

export default function BottomNav({
  state,
  navigation,
}: BottomTabBarProps) {
  const { isPlaying, togglePlay } = usePlayerStore()

  const onTabPress = (routeName: string, isActive: boolean) => {
    if (routeName === "Home" && isActive) {
      togglePlay()
    } else {
      navigation.navigate(routeName as any)
    }
  }

  // Hide on settings pages (handled by stack navigator)
  const currentRoute = state.routeNames[state.index]
  const isSettings =
    currentRoute === "Settings" ||
    currentRoute.startsWith("Settings")

  if (isSettings) return null

  return (
    <View style={styles.container}>
      <View style={styles.nav}>
        {state.routes.map((route, index) => {
          const isActive = state.index === index
          const iconName = route.name as keyof typeof TAB_ICONS

          // Home icon toggles between play/pause
          const IconComp =
            route.name === "Home" && isActive && isPlaying
              ? IconPause
              : TAB_ICONS[iconName]

          return (
            <TouchableOpacity
              key={route.key}
              onPress={() => onTabPress(route.name, isActive)}
              activeOpacity={0.7}
              style={styles.tabItem}
            >
              <View
                style={[
                  styles.iconContainer,
                  isActive && styles.activeIcon,
                ]}
              >
                {IconComp && (
                  <IconComp
                    size={22}
                    color={isActive ? "#000" : "rgba(0,0,0,0.6)"}
                  />
                )}
                {route.name === "Home" && (
                  <View style={styles.homeIcon}>
                    {isActive && isPlaying ? (
                      <IconPause size={22} color="#000" />
                    ) : (
                      <IconPlay size={22} color={isActive ? "#000" : "rgba(0,0,0,0.6)"} />
                    )}
                  </View>
                )}
              </View>
              <Text
                style={[
                  styles.label,
                  isActive && styles.activeLabel,
                ]}
              >
                {TAB_LABELS[iconName] || route.name}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 24,
    left: 24,
    right: 24,
    alignItems: "center",
    zIndex: 50,
  },
  nav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: "rgba(255,255,255,0.75)",
    borderRadius: 100,
    paddingHorizontal: 24,
    paddingVertical: 12,
    width: "100%",
    maxWidth: 400,
    borderWidth: 0.5,
    borderColor: "rgba(0,0,0,0.06)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 30,
    elevation: 8,
  },
  tabItem: {
    alignItems: "center",
    gap: 4,
  },
  iconContainer: {
    padding: 8,
    borderRadius: 16,
  },
  activeIcon: {
    backgroundColor: "rgba(0,0,0,0.1)",
    transform: [{ scale: 1.1 }],
  },
  homeIcon: {
    padding: 8,
    borderRadius: 16,
  },
  label: {
    fontSize: 10,
    fontWeight: "500",
    color: "rgba(0,0,0,0.3)",
  },
  activeLabel: {
    color: "#000",
  },
})