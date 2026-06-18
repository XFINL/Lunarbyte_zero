import React, { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native"
import { useNavigation } from "@react-navigation/native"
import { useUserStore } from "@/store/userStore"
import {
  IconUser,
  IconHeartFilled,
  IconClose,
  IconSearch,
  IconSettings,
  IconArrowRight,
} from "@/components/Icons"

export default function ProfilePage() {
  const navigation = useNavigation()
  const {
    profile,
    favorites,
    updateName,
    getRemainingSearches,
    getDailyLimit,
  } = useUserStore()

  const [editing, setEditing] = useState(false)
  const [nameInput, setNameInput] = useState(profile.name)

  const handleSaveName = () => {
    const trimmed = nameInput.trim()
    if (trimmed.length === 0) {
      Alert.alert("提示", "名称不能为空")
      setNameInput(profile.name)
      return
    }
    updateName(trimmed)
    setEditing(false)
  }

  const handleCancelEdit = () => {
    setNameInput(profile.name)
    setEditing(false)
  }

  const remaining = getRemainingSearches()
  const dailyLimit = getDailyLimit()
  const quotaPercent = dailyLimit > 0 ? (remaining / dailyLimit) * 100 : 0

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>个人主页</Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => navigation.navigate("Settings" as never)}
        >
          <IconSettings size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Avatar */}
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          {profile.avatar ? (
            <Text style={styles.avatarText}>?</Text>
          ) : (
            <IconUser size={48} color="#fff" />
          )}
        </View>
      </View>

      {/* Name */}
      <View style={styles.nameRow}>
        {editing ? (
          <>
            <TextInput
              style={styles.nameInput}
              value={nameInput}
              onChangeText={setNameInput}
              autoFocus
              selectTextOnFocus
              onSubmitEditing={handleSaveName}
            />
            <TouchableOpacity onPress={handleSaveName}>
              <Text style={styles.saveText}>保存</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleCancelEdit}>
              <IconClose size={20} color="#888" />
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.nameText}>{profile.name}</Text>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setEditing(true)}
            >
              <Text style={styles.editButtonText}>编辑</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Stats */}
      <Text style={styles.statsText}>
        {favorites.length} 首收藏 · {profile.isVip ? "VIP" : "普通用户"}
      </Text>

      {/* Search Quota */}
      <View style={styles.quotaSection}>
        <View style={styles.quotaHeader}>
          <IconSearch size={16} color="#fff" />
          <Text style={styles.quotaLabel}>今日搜索次数</Text>
        </View>
        <View style={styles.progressBarBg}>
          <View
            style={[styles.progressBarFill, { width: `${quotaPercent}%` }]}
          />
        </View>
        <Text style={styles.quotaText}>
          {remaining} / {dailyLimit} 次剩余
        </Text>
      </View>

      {/* Favorites Link */}
      <TouchableOpacity
        style={styles.favoritesLink}
        onPress={() => navigation.navigate("Favorites" as never)}
      >
        <View style={styles.favoritesLinkLeft}>
          <IconHeartFilled size={20} color="#ff4757" />
          <Text style={styles.favoritesLinkText}>点赞列表</Text>
        </View>
        <IconArrowRight size={20} color="#888" />
      </TouchableOpacity>
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
    justifyContent: "center",
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  settingsButton: {
    position: "absolute",
    right: 0,
    top: 60,
    padding: 4,
  },
  avatarContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#333",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 32,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    gap: 8,
  },
  nameText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },
  nameInput: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    borderBottomWidth: 1,
    borderBottomColor: "#fff",
    minWidth: 120,
    textAlign: "center",
    paddingVertical: 2,
  },
  saveText: {
    color: "#1e90ff",
    fontSize: 16,
    fontWeight: "600",
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#555",
  },
  editButtonText: {
    color: "#aaa",
    fontSize: 13,
  },
  statsText: {
    color: "#aaa",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
  },
  quotaSection: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 16,
    marginTop: 28,
  },
  quotaHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  quotaLabel: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#333",
    marginTop: 12,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
    backgroundColor: "#1e90ff",
  },
  quotaText: {
    color: "#aaa",
    fontSize: 12,
    marginTop: 6,
  },
  favoritesLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  favoritesLinkLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  favoritesLinkText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
})