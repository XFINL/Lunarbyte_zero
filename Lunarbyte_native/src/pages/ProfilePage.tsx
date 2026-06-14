import { StyleSheet, View, Text, TextInput, TouchableOpacity, Image } from "react-native"
import { useState } from "react"
import { useNavigation } from "@react-navigation/native"
import { useUserStore } from "@/store/userStore"
import { IconUser, IconHeartFilled, IconClose, IconSearch, IconSettings, IconArrowRight } from "@/components/Icons"

export default function ProfilePage() {
  const { profile, favorites, updateName, getRemainingSearches, getDailyLimit } = useUserStore()
  const navigation = useNavigation<any>()
  const [editing, setEditing] = useState(false)
  const [nameInput, setNameInput] = useState(profile.name)

  const handleSaveName = () => {
    const trimmed = nameInput.trim()
    if (trimmed) {
      updateName(trimmed)
    } else {
      setNameInput(profile.name)
    }
    setEditing(false)
  }

  const remaining = getRemainingSearches()
  const dailyLimit = getDailyLimit()

  return (
    <View style={styles.container}>
      {/* 设置按钮 */}
      <TouchableOpacity style={styles.settingsButton} onPress={() => navigation.navigate("settings")}>
        <IconSettings size={20} color="rgba(0,0,0,0.3)" />
      </TouchableOpacity>

      {/* 用户信息 */}
      <View style={styles.userSection}>
        <View style={styles.avatarContainer}>
          {profile.avatar ? (
            <Image source={{ uri: profile.avatar }} style={styles.avatarImage} />
          ) : (
            <IconUser size={28} color="rgba(0,0,0,0.3)" />
          )}
        </View>
        <View style={styles.userInfo}>
          {editing ? (
            <View style={styles.editRow}>
              <TextInput
                value={nameInput}
                onChangeText={setNameInput}
                onSubmitEditing={handleSaveName}
                style={styles.nameInput}
                autoFocus
              />
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveName}>
                <Text style={styles.saveButtonText}>保存</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setEditing(false); setNameInput(profile.name) }}>
                <IconClose size={16} color="rgba(0,0,0,0.3)" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.nameRow}>
              <Text style={styles.nameText} numberOfLines={1}>{profile.name}</Text>
              <TouchableOpacity onPress={() => setEditing(true)}>
                <Text style={styles.editText}>编辑</Text>
              </TouchableOpacity>
            </View>
          )}
          <Text style={styles.userMeta}>
            {favorites.length} 首收藏 · {profile.isVip ? "VIP" : "普通用户"}
          </Text>
        </View>
      </View>

      {/* 搜索额度 */}
      <View style={styles.quotaContainer}>
        <View style={styles.quotaHeader}>
          <View style={styles.quotaLabel}>
            <IconSearch size={16} color="rgba(0,0,0,0.4)" />
            <Text style={styles.quotaLabelText}>今日搜索额度</Text>
          </View>
          <Text style={styles.quotaValue}>{remaining} / {dailyLimit}</Text>
        </View>
        <View style={styles.quotaBarBg}>
          <View style={[styles.quotaBarFill, { width: `${((dailyLimit - remaining) / dailyLimit) * 100}%` }]} />
        </View>
      </View>

      {/* 点赞列表 */}
      <TouchableOpacity
        style={styles.favoritesRow}
        onPress={() => navigation.navigate("favorites")}
      >
        <View style={styles.favoritesLeft}>
          <IconHeartFilled size={18} color="rgba(0,0,0,0.4)" />
          <Text style={styles.favoritesLabel}>点赞列表</Text>
        </View>
        <View style={styles.favoritesRight}>
          <Text style={styles.favoritesCount}>{favorites.length} 首</Text>
          <IconArrowRight size={14} color="rgba(0,0,0,0.3)" />
        </View>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 20, paddingTop: 56, paddingBottom: 112 },
  settingsButton: { position: "absolute", top: 16, right: 20, padding: 6 },
  userSection: { flexDirection: "row", alignItems: "center", gap: 16, paddingVertical: 24 },
  avatarContainer: { width: 64, height: 64, borderRadius: 32, backgroundColor: "rgba(0,0,0,0.05)", alignItems: "center", justifyContent: "center", overflow: "hidden" },
  avatarImage: { width: 64, height: 64 },
  userInfo: { flex: 1, minWidth: 0 },
  editRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  nameInput: { flex: 1, backgroundColor: "rgba(0,0,0,0.05)", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, fontSize: 18, fontWeight: "600", color: "#000" },
  saveButton: { backgroundColor: "#000", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 },
  saveButtonText: { fontSize: 12, color: "#fff" },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  nameText: { fontSize: 20, fontWeight: "600", color: "#000", flex: 1 },
  editText: { fontSize: 12, color: "rgba(0,0,0,0.3)" },
  userMeta: { fontSize: 14, color: "rgba(0,0,0,0.4)", marginTop: 4 },
  quotaContainer: { backgroundColor: "rgba(0,0,0,0.05)", borderRadius: 16, padding: 16, marginBottom: 24 },
  quotaHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  quotaLabel: { flexDirection: "row", alignItems: "center", gap: 8 },
  quotaLabelText: { fontSize: 14, color: "rgba(0,0,0,0.5)" },
  quotaValue: { fontSize: 12, color: "rgba(0,0,0,0.3)" },
  quotaBarBg: { height: 8, backgroundColor: "rgba(0,0,0,0.05)", borderRadius: 4, overflow: "hidden" },
  quotaBarFill: { height: "100%", backgroundColor: "rgba(0,0,0,0.2)", borderRadius: 4 },
  favoritesRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "rgba(0,0,0,0.05)", borderRadius: 16, padding: 16 },
  favoritesLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  favoritesLabel: { fontSize: 14, fontWeight: "500", color: "#000" },
  favoritesRight: { flexDirection: "row", alignItems: "center", gap: 4 },
  favoritesCount: { fontSize: 12, color: "rgba(0,0,0,0.3)" },
})
