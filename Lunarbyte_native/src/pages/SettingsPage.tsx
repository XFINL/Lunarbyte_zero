import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { IconArrowLeft, IconArrowRight } from "@/components/Icons"

const sections = [
  { path: "settings-general" as const, label: "通用设置", desc: "字体大小、App 配色" },
  { path: "settings-experimental" as const, label: "实验功能", desc: "定时关闭" },
  { path: "settings-language" as const, label: "语言设置", desc: "切换 App 语言" },
  { path: "settings-about" as const, label: "关于我们", desc: "版本信息、官网" },
]

export default function SettingsPage() {
  const navigation = useNavigation<any>()

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <IconArrowLeft size={22} color="rgba(0,0,0,0.3)" />
        </TouchableOpacity>
        <Text style={styles.title}>设置</Text>
      </View>

      <View style={styles.list}>
        {sections.map((s) => (
          <TouchableOpacity
            key={s.path}
            style={styles.item}
            onPress={() => navigation.navigate(s.path)}
          >
            <View>
              <Text style={styles.itemLabel}>{s.label}</Text>
              <Text style={styles.itemDesc}>{s.desc}</Text>
            </View>
            <IconArrowRight size={16} color="rgba(0,0,0,0.3)" />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 20, paddingTop: 56, paddingBottom: 112 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 24 },
  title: { fontSize: 24, fontWeight: "600", color: "#000" },
  list: { gap: 8 },
  item: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "rgba(0,0,0,0.05)", borderRadius: 16, paddingHorizontal: 20, paddingVertical: 16 },
  itemLabel: { fontSize: 14, fontWeight: "500", color: "#000" },
  itemDesc: { fontSize: 12, color: "rgba(0,0,0,0.3)", marginTop: 2 },
})
