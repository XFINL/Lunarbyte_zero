import React from "react"
import { View, Text, StyleSheet, TouchableOpacity, Linking } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { IconArrowLeft } from "@/components/Icons"

const ABOUT_INFO = [
  { label: "应用名称", value: "Wave Music" },
  { label: "版本号", value: "v1.0.0" },
] as const

const OFFICIAL_URL = "zero.lunarbyte.pw"

export default function SettingsAboutPage() {
  const navigation = useNavigation()

  const handleOpenUrl = () => {
    Linking.openURL(`https://${OFFICIAL_URL}`)
  }

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
        <Text style={styles.headerTitle}>关于我们</Text>
      </View>

      {/* Info Rows */}
      <View style={styles.infoList}>
        {ABOUT_INFO.map((item) => (
          <View key={item.label} style={styles.infoRow}>
            <Text style={styles.infoLabel}>{item.label}</Text>
            <Text style={styles.infoValue}>{item.value}</Text>
          </View>
        ))}
        <TouchableOpacity style={styles.infoRow} onPress={handleOpenUrl}>
          <Text style={styles.infoLabel}>官网</Text>
          <Text style={styles.infoLink}>{OFFICIAL_URL}</Text>
        </TouchableOpacity>
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
  infoList: {
    marginTop: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  infoLabel: {
    color: "#aaa",
    fontSize: 15,
  },
  infoValue: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "500",
  },
  infoLink: {
    color: "#1e90ff",
    fontSize: 15,
    fontWeight: "500",
    textDecorationLine: "underline",
  },
})