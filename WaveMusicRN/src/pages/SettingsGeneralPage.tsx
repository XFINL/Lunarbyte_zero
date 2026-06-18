import React from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { useUserStore } from "@/store/userStore"
import { IconArrowLeft } from "@/components/Icons"
import type { AppSettings } from "@/types"

const FONT_OPTIONS: { label: string; value: AppSettings["fontSize"] }[] = [
  { label: "小", value: "small" },
  { label: "标准", value: "normal" },
  { label: "大", value: "large" },
]

const COLOR_OPTIONS: {
  label: string
  value: AppSettings["colorScheme"]
  color: string
}[] = [
  { label: "白", value: "white", color: "#fff" },
  { label: "淡蓝", value: "blue", color: "#87CEEB" },
  { label: "薰衣草", value: "lavender", color: "#E6E6FA" },
  { label: "浅绿", value: "green", color: "#98FB98" },
]

export default function SettingsGeneralPage() {
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
        <Text style={styles.headerTitle}>通用设置</Text>
      </View>

      {/* Font Size */}
      <Text style={styles.sectionTitle}>字体大小</Text>
      <View style={styles.optionRow}>
        {FONT_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[
              styles.optionButton,
              settings.fontSize === opt.value && styles.optionButtonActive,
            ]}
            onPress={() => updateSettings({ fontSize: opt.value })}
          >
            <Text
              style={[
                styles.optionText,
                settings.fontSize === opt.value && styles.optionTextActive,
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Color Scheme */}
      <Text style={styles.sectionTitle}>App 配色</Text>
      <View style={styles.colorRow}>
        {COLOR_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={styles.colorItem}
            onPress={() => updateSettings({ colorScheme: opt.value })}
          >
            <View
              style={[
                styles.colorCircle,
                { backgroundColor: opt.color },
                settings.colorScheme === opt.value &&
                  styles.colorCircleActive,
              ]}
            />
            <Text style={styles.colorLabel}>{opt.label}</Text>
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
  optionRow: {
    flexDirection: "row",
    gap: 12,
  },
  optionButton: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  optionButtonActive: {
    backgroundColor: "#333",
    borderWidth: 1,
    borderColor: "#fff",
  },
  optionText: {
    color: "#888",
    fontSize: 15,
    fontWeight: "500",
  },
  optionTextActive: {
    color: "#fff",
    fontWeight: "700",
  },
  colorRow: {
    flexDirection: "row",
    gap: 20,
  },
  colorItem: {
    alignItems: "center",
    gap: 8,
  },
  colorCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "transparent",
  },
  colorCircleActive: {
    borderColor: "#fff",
  },
  colorLabel: {
    color: "#aaa",
    fontSize: 12,
  },
})