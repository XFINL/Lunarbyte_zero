import { StyleSheet, View, Text, TouchableOpacity, Linking } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { IconArrowLeft } from "@/components/Icons"

export default function SettingsAboutPage() {
  const navigation = useNavigation<any>()

  const openWebsite = () => {
    Linking.openURL("https://zero.lunarbyte.pw")
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <IconArrowLeft size={22} color="rgba(0,0,0,0.3)" />
        </TouchableOpacity>
        <Text style={styles.title}>关于我们</Text>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>应用名称</Text>
          <Text style={styles.infoValue}>Wave Music</Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>版本号</Text>
          <Text style={styles.infoValue}>v1.0.0</Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>官网</Text>
          <TouchableOpacity onPress={openWebsite}>
            <Text style={styles.linkText}>zero.lunarbyte.pw</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 20, paddingTop: 56, paddingBottom: 112 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 24 },
  title: { fontSize: 24, fontWeight: "600", color: "#000" },
  infoCard: { backgroundColor: "rgba(0,0,0,0.05)", borderRadius: 16, overflow: "hidden" },
  infoRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 16 },
  infoLabel: { fontSize: 14, color: "rgba(0,0,0,0.5)" },
  infoValue: { fontSize: 14, color: "rgba(0,0,0,0.7)" },
  separator: { height: 0.5, backgroundColor: "rgba(0,0,0,0.05)" },
  linkText: { fontSize: 14, color: "rgba(0,0,0,0.7)", textDecorationLine: "underline" },
})
