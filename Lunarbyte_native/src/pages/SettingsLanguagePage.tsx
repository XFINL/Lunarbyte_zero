import { StyleSheet, View, Text, TouchableOpacity } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { useUserStore } from "@/store/userStore"
import { IconArrowLeft } from "@/components/Icons"

const LANG_OPTIONS = [
  { value: "zh" as const, label: "中文" },
  { value: "en" as const, label: "English" },
]

export default function SettingsLanguagePage() {
  const navigation = useNavigation<any>()
  const { settings, updateSettings } = useUserStore()

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <IconArrowLeft size={22} color="rgba(0,0,0,0.3)" />
        </TouchableOpacity>
        <Text style={styles.title}>语言设置</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>选择 App 显示语言</Text>
        <View style={styles.optionsRow}>
          {LANG_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.optionButton,
                settings.language === opt.value && styles.optionButtonActive,
              ]}
              onPress={() => updateSettings({ language: opt.value })}
            >
              <Text style={[
                styles.optionText,
                settings.language === opt.value && styles.optionTextActive,
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
  section: { backgroundColor: "rgba(0,0,0,0.05)", borderRadius: 16, padding: 20 },
  sectionLabel: { fontSize: 14, color: "rgba(0,0,0,0.5)", marginBottom: 12 },
  optionsRow: { flexDirection: "row", gap: 8 },
  optionButton: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: "center", backgroundColor: "rgba(255,255,255,0.5)" },
  optionButtonActive: { backgroundColor: "#000" },
  optionText: { fontSize: 14, color: "rgba(0,0,0,0.5)" },
  optionTextActive: { color: "#fff" },
})
