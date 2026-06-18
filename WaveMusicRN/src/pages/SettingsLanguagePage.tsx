import React from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { useUserStore } from "@/store/userStore"
import { IconArrowLeft } from "@/components/Icons"
import type { AppSettings } from "@/types"

const LANG_OPTIONS: { label: string; value: AppSettings["language"] }[] = [
  { label: "中文", value: "zh" },
  { label: "English", value: "en" },
]

export default function SettingsLanguagePage() {
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
        <Text style={styles.headerTitle}>语言设置</Text>
      </View>

      {/* Language Options */}
      <View style={styles.langRow}>
        {LANG_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[
              styles.langButton,
              settings.language === opt.value && styles.langButtonActive,
            ]}
            onPress={() => updateSettings({ language: opt.value })}
          >
            <Text
              style={[
                styles.langText,
                settings.language === opt.value && styles.langTextActive,
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
  langRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  langButton: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  langButtonActive: {
    backgroundColor: "#333",
    borderWidth: 1,
    borderColor: "#fff",
  },
  langText: {
    color: "#888",
    fontSize: 16,
    fontWeight: "500",
  },
  langTextActive: {
    color: "#fff",
    fontWeight: "700",
  },
})