import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { useUserStore } from "@/store/userStore"
import { IconArrowLeft } from "@/components/Icons"

const FONT_OPTIONS = [
  { value: "small" as const, label: "小" },
  { value: "normal" as const, label: "标准" },
  { value: "large" as const, label: "大" },
]

const COLOR_OPTIONS = [
  { value: "white" as const, label: "白", color: "#ffffff" },
  { value: "blue" as const, label: "淡蓝", color: "#e8f4fd" },
  { value: "lavender" as const, label: "薰衣草", color: "#f3e8ff" },
  { value: "green" as const, label: "浅绿", color: "#ecfdf5" },
]

export default function SettingsGeneralPage() {
  const navigation = useNavigation<any>()
  const { settings, updateSettings } = useUserStore()

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <IconArrowLeft size={22} color="rgba(0,0,0,0.3)" />
        </TouchableOpacity>
        <Text style={styles.title}>通用设置</Text>
      </View>

      {/* 字体大小 */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>字体大小</Text>
        <View style={styles.optionsRow}>
          {FONT_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.optionButton,
                settings.fontSize === opt.value && styles.optionButtonActive,
              ]}
              onPress={() => updateSettings({ fontSize: opt.value })}
            >
              <Text style={[
                styles.optionText,
                settings.fontSize === opt.value && styles.optionTextActive,
              ]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* App 配色 */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>App 配色</Text>
        <View style={styles.optionsRow}>
          {COLOR_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.optionButton,
                settings.colorScheme === opt.value && styles.optionButtonActive,
              ]}
              onPress={() => updateSettings({ colorScheme: opt.value })}
            >
              <View style={[styles.colorDot, { backgroundColor: opt.color }]} />
              <Text style={[
                styles.optionText,
                settings.colorScheme === opt.value && styles.optionTextActive,
              ]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 20, paddingTop: 56, paddingBottom: 112 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 24 },
  title: { fontSize: 24, fontWeight: "600", color: "#000" },
  section: { backgroundColor: "rgba(0,0,0,0.05)", borderRadius: 16, padding: 20, marginBottom: 16 },
  sectionLabel: { fontSize: 14, color: "rgba(0,0,0,0.5)", marginBottom: 12 },
  optionsRow: { flexDirection: "row", gap: 8 },
  optionButton: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: "center", backgroundColor: "rgba(255,255,255,0.5)" },
  optionButtonActive: { backgroundColor: "#000" },
  optionText: { fontSize: 14, color: "rgba(0,0,0,0.5)" },
  optionTextActive: { color: "#fff" },
  colorDot: { width: 20, height: 20, borderRadius: 10, borderWidth: 1, borderColor: "rgba(0,0,0,0.1)", marginBottom: 6 },
})
