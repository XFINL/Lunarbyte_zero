import { StyleSheet, View, Text, TouchableOpacity } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { useUserStore } from "@/store/userStore"
import { IconArrowLeft } from "@/components/Icons"

const TIMER_OPTIONS = [
  { value: 0, label: "关闭" },
  { value: 15, label: "15 分钟" },
  { value: 30, label: "30 分钟" },
  { value: 45, label: "45 分钟" },
  { value: 60, label: "60 分钟" },
]

export default function SettingsExperimentalPage() {
  const navigation = useNavigation<any>()
  const { settings, updateSettings } = useUserStore()

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <IconArrowLeft size={22} color="rgba(0,0,0,0.3)" />
        </TouchableOpacity>
        <Text style={styles.title}>实验功能</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>定时关闭</Text>
        <Text style={styles.sectionDesc}>到达设定时间后自动暂停播放</Text>
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
              <Text style={[
                styles.timerText,
                settings.timerMinutes === opt.value && styles.timerTextActive,
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
  sectionLabel: { fontSize: 14, color: "rgba(0,0,0,0.5)", marginBottom: 8 },
  sectionDesc: { fontSize: 12, color: "rgba(0,0,0,0.3)", marginBottom: 16 },
  timerRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  timerButton: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.5)" },
  timerButtonActive: { backgroundColor: "#000" },
  timerText: { fontSize: 14, color: "rgba(0,0,0,0.5)" },
  timerTextActive: { color: "#fff" },
})
