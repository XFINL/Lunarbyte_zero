import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { StatusBar } from "expo-status-bar"
import { useEffect } from "react"
import { useUserStore } from "@/store/userStore"

import CrashLogger from "@/components/CrashLogger"
import PlayerEngine from "@/components/PlayerEngine"
import BottomNav from "@/components/BottomNav"

import HomePage from "@/pages/HomePage"
import SearchPage from "@/pages/SearchPage"
import ProfilePage from "@/pages/ProfilePage"
import FavoritesPage from "@/pages/FavoritesPage"
import SettingsPage from "@/pages/SettingsPage"
import SettingsGeneralPage from "@/pages/SettingsGeneralPage"
import SettingsExperimentalPage from "@/pages/SettingsExperimentalPage"
import SettingsLanguagePage from "@/pages/SettingsLanguagePage"
import SettingsAboutPage from "@/pages/SettingsAboutPage"

const Stack = createNativeStackNavigator()

export default function App() {
  const colorScheme = useUserStore((s) => s.settings.colorScheme)

  const getThemeBg = () => {
    switch (colorScheme) {
      case "blue": return "#e8f4fd"
      case "lavender": return "#f3e8ff"
      case "green": return "#ecfdf5"
      default: return "#ffffff"
    }
  }

  useEffect(() => {
    // RN doesn't need data-theme, but we keep the store synced
  }, [colorScheme])

  return (
    <SafeAreaProvider>
      <CrashLogger />
      <StatusBar style="dark" />
      <PlayerEngine />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            animation: "slide_from_right",
            contentStyle: { backgroundColor: getThemeBg() },
          }}
        >
          <Stack.Screen name="home" component={HomePage} />
          <Stack.Screen name="search" component={SearchPage} />
          <Stack.Screen name="profile" component={ProfilePage} />
          <Stack.Screen name="favorites" component={FavoritesPage} />
          <Stack.Screen name="settings" component={SettingsPage} />
          <Stack.Screen name="settings-general" component={SettingsGeneralPage} />
          <Stack.Screen name="settings-experimental" component={SettingsExperimentalPage} />
          <Stack.Screen name="settings-language" component={SettingsLanguagePage} />
          <Stack.Screen name="settings-about" component={SettingsAboutPage} />
        </Stack.Navigator>
      </NavigationContainer>
      <BottomNav />
    </SafeAreaProvider>
  )
}
