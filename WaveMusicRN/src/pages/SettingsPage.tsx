import React from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { IconArrowLeft, IconArrowRight } from "@/components/Icons"

const SETTINGS_SECTIONS = [
  { key: "SettingsGeneral", label: "通用设置", desc: "字体大小、App 配色" },
  { key: "SettingsExperimental", label: "实验功能", desc: "定时关闭" },
  { key: "SettingsLanguage", label: "语言设置", desc: "切换 App 语言" },
  { key: "SettingsAbout", label: "关于我们", desc: "版本信息、官网" },
] as const

export default function SettingsPage() {
  const navigation = useNavigation()

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
        <Text style={styles.headerTitle}>设置</Text>
      </View>

      {/* Sections */}
      <View style={styles.sectionList}>
        {SETTINGS_SECTIONS.map((section) => (
          <TouchableOpacity
            key={section.key}
            style={styles.sectionRow}
            onPress={() => navigation.navigate(section.key as never)}
          >
            <View style={styles.sectionTextWrap}>
              <Text style={styles.sectionLabel}>{section.label}</Text>
              <Text style={styles.sectionDesc}>{section.desc}</Text>
            </View>
            <IconArrowRight size={20} color="#888" />
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
  sectionList: {
    marginTop: 8,
  },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  sectionTextWrap: {
    flex: 1,
  },
  sectionLabel: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  sectionDesc: {
    color: "#888",
    fontSize: 13,
    marginTop: 4,
  },
})