import React from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { useUserStore } from "@/store/userStore"
import { IconArrowLeft } from "@/components/Icons"

const TIMER_OPTIONS = [
  { label: "关闭", value: 0 },
  { label: "15 分钟", value: 15 },
  { label: "30 分钟", value: 30 },
  { label: "45 分钟", value: 45 },
  { label: "60 分钟", value: 60 },
] as const

export default function SettingsExperimentalPage() {
  const navigation = useNavigation()
  const { settings, updateSettings } = useUserStore()

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <IconArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>实验功能</Text>
      </View>

      {/* Timer */}
      <Text style={styles.sectionTitle}>定时关闭</Text>
      <View style={styles.timerRow}>
        {TIMER_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[
              styles.timerButton,
              settings.timerMinutes === opt.value && styles.timerButtonActive,
            ]}
            onPress={() => updateSettings({ timerMinutes: opt.value })}
          >
            <Text
              style={[
                styles.timerText,
                settings.timerMinutes === opt.value && styles.timerTextActive,
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  sectionTitle: {
    color: "#aaa",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 24,
    marginBottom: 12,
  },
  timerRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  timerButton: {
    backgroundColor: "#1a1a1a",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  timerButtonActive: {
    backgroundColor: "#333",
    borderWidth: 1,
    borderColor: "#fff",
  },
  timerText: {
    color: "#888",
    fontSize: 15,
    fontWeight: "500",
  },
  timerTextActive: {
    color: "#fff",
    fontWeight: "700",
  },
})