import React, { useEffect } from "react"
import { View, StyleSheet, StatusBar } from "react-native"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { usePlayerStore } from "@/store/playerStore"
import { useUserStore } from "@/store/userStore"
import { useSearchStore } from "@/store/searchStore"
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

export type RootStackParamList = {
  MainTabs: undefined
  Favorites: undefined
  Settings: undefined
  SettingsGeneral: undefined
  SettingsExperimental: undefined
  SettingsLanguage: undefined
  SettingsAbout: undefined
}

export type TabParamList = {
  Home: undefined
  Search: undefined
  Profile: undefined
}

const Stack = createNativeStackNavigator<RootStackParamList>()
const Tab = createBottomTabNavigator<TabParamList>()

function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <BottomNav {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={HomePage} />
      <Tab.Screen name="Search" component={SearchPage} />
      <Tab.Screen name="Profile" component={ProfilePage} />
    </Tab.Navigator>
  )
}

export default function App() {
  const hydratePlayer = usePlayerStore((s) => s.hydrate)
  const hydrateUser = useUserStore((s) => s.hydrate)
  const hydrateSearch = useSearchStore((s) => s.hydrate)

  useEffect(() => {
    hydratePlayer()
    hydrateUser()
    hydrateSearch()
  }, [hydratePlayer, hydrateUser, hydrateSearch])

  return (
    <GestureHandlerRootView style={styles.root}>
      <NavigationContainer>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <PlayerEngine />
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            animation: "slide_from_right",
            contentStyle: { backgroundColor: "#fff" },
          }}
        >
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="Settings" component={SettingsPage} />
          <Stack.Screen name="SettingsGeneral" component={SettingsGeneralPage} />
          <Stack.Screen
            name="SettingsExperimental"
            component={SettingsExperimentalPage}
          />
          <Stack.Screen name="SettingsLanguage" component={SettingsLanguagePage} />
          <Stack.Screen name="SettingsAbout" component={SettingsAboutPage} />
          <Stack.Screen name="Favorites" component={FavoritesPage} />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#fff",
  },
})