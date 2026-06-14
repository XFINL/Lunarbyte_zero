import { StyleSheet, View, Text, TextInput, TouchableOpacity, Modal, FlatList, Image } from "react-native"
import { useState, useRef, useEffect, useCallback } from "react"
import { useSearchStore } from "@/store/searchStore"
import { usePlayerStore } from "@/store/playerStore"
import { useUserStore } from "@/store/userStore"
import { IconSearch, IconClose, IconHeart, IconHeartFilled } from "@/components/Icons"
import type { Song } from "@/data/mock"

export default function SearchPage() {
  const { query, setQuery, results, history, search, removeHistory, clearHistory, loading } = useSearchStore()
  const { play, currentSong, togglePlay } = usePlayerStore()
  const { isFavorite, toggleFavorite } = useUserStore()
  const { consumeSearch } = useUserStore()
  const [confirmDeleteTag, setConfirmDeleteTag] = useState<string | null>(null)
  const [confirmClearAll, setConfirmClearAll] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 1000)
      return () => clearTimeout(t)
    }
  }, [toast])

  const handleSearch = useCallback(
    async (q: string) => {
      setQuery(q)
      if (!consumeSearch()) {
        setToast("今日搜索次数已达上限")
        return
      }
      await search(q)
    },
    [setQuery, search, consumeSearch],
  )

  const handleSearchClick = useCallback(async () => {
    if (query.trim()) {
      if (!consumeSearch()) {
        setToast("今日搜索次数已达上限")
        return
      }
      await search(query)
    }
  }, [query, search, consumeSearch])

  const handleInputChange = useCallback(
    (value: string) => {
      setQuery(value)
      if (!value.trim()) {
        search("")
      }
    },
    [setQuery, search],
  )

  const handlePlaySong = (song: Song) => {
    if (currentSong?.id === song.id) {
      togglePlay()
    } else {
      play(song)
    }
    setToast(song.title)
  }

  const handleTagTouchStart = (keyword: string) => {
    longPressTimer.current = setTimeout(() => {
      setConfirmDeleteTag(keyword)
    }, 500)
  }

  const handleTagTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }

  return (
    <View style={styles.container}>
      {/* Toast */}
      {toast && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>
            已添加「<Text style={styles.toastHighlight}>{toast}</Text>」
          </Text>
        </View>
      )}

      {/* 确认弹窗 - 删除单个标签 */}
      <Modal visible={!!confirmDeleteTag} transparent animationType="fade">
        <View style={styles.confirmContainer}>
          <View style={styles.confirmDialog}>
            <Text style={styles.confirmText}>
              是否删除搜索词「<Text style={styles.confirmHighlight}>{confirmDeleteTag}</Text>」？
            </Text>
            <View style={styles.confirmButtons}>
              <TouchableOpacity style={styles.confirmCancel} onPress={() => setConfirmDeleteTag(null)}>
                <Text style={styles.confirmCancelText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmOk} onPress={() => { removeHistory(confirmDeleteTag!); setConfirmDeleteTag(null) }}>
                <Text style={styles.confirmOkText}>删除</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 确认弹窗 - 清空全部 */}
      <Modal visible={confirmClearAll} transparent animationType="fade">
        <View style={styles.confirmContainer}>
          <View style={styles.confirmDialog}>
            <Text style={styles.confirmText}>确定要清空所有搜索历史吗？</Text>
            <View style={styles.confirmButtons}>
              <TouchableOpacity style={styles.confirmCancel} onPress={() => setConfirmClearAll(false)}>
                <Text style={styles.confirmCancelText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmOk} onPress={() => { clearHistory(); setConfirmClearAll(false) }}>
                <Text style={styles.confirmOkText}>清空</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 标题 */}
      <Text style={styles.title}>搜索</Text>

      {/* 搜索框 */}
      <View style={styles.searchContainer}>
        <View style={styles.searchIconWrapper}>
          <IconSearch size={18} color="rgba(0,0,0,0.25)" />
        </View>
        <TextInput
          value={query}
          onChangeText={handleInputChange}
          onSubmitEditing={handleSearchClick}
          placeholder="搜索歌曲、歌手..."
          style={styles.searchInput}
          placeholderTextColor="rgba(0,0,0,0.25)"
        />
        {query !== "" && (
          <TouchableOpacity style={styles.clearButton} onPress={() => handleInputChange("")}>
            <IconClose size={16} color="rgba(0,0,0,0.2)" />
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.searchButton} onPress={handleSearchClick} disabled={loading}>
          <IconSearch size={18} color={loading ? "rgba(0,0,0,0.1)" : "rgba(0,0,0,0.3)"} />
        </TouchableOpacity>
      </View>

      {/* 搜索历史 */}
      {!query && history.length > 0 && (
        <View style={styles.historyContainer}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>搜索历史</Text>
            <TouchableOpacity onPress={() => setConfirmClearAll(true)}>
              <Text style={styles.historyClear}>全部删除</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.tagsContainer}>
            {history.map((keyword) => (
              <TouchableOpacity
                key={keyword}
                style={styles.tag}
                onPress={() => handleSearch(keyword)}
                onTouchStart={() => handleTagTouchStart(keyword)}
                onTouchEnd={handleTagTouchEnd}
              >
                <Text style={styles.tagText}>{keyword}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.hintText}>长按标签可删除</Text>
        </View>
      )}

      {/* 搜索结果 */}
      {query && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsCount}>找到 {results.length} 首歌曲</Text>
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            renderItem={({ item: song }) => {
              const isActive = currentSong?.id === song.id
              const isFav = isFavorite(song.id)
              return (
                <TouchableOpacity style={styles.resultItem} onPress={() => handlePlaySong(song)}>
                  <Image source={{ uri: song.cover }} style={styles.resultCover} />
                  <View style={styles.resultInfo}>
                    <Text style={[styles.resultTitle, isActive && styles.resultTitleActive]} numberOfLines={1}>
                      {song.title}
                    </Text>
                    <Text style={styles.resultArtist} numberOfLines={1}>{song.artist}</Text>
                  </View>
                  <TouchableOpacity onPress={() => toggleFavorite(song)}>
                    {isFav
                      ? <IconHeartFilled size={16} color="#000" />
                      : <IconHeart size={16} color="rgba(0,0,0,0.2)" />
                    }
                  </TouchableOpacity>
                </TouchableOpacity>
              )
            }}
            ListEmptyComponent={
              loading
                ? <Text style={styles.emptyText}>搜索中...</Text>
                : <Text style={styles.emptyText}>未找到相关歌曲</Text>
            }
          />
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 20, paddingTop: 56, paddingBottom: 112 },
  toast: { position: "absolute", top: 16, left: 16, elevation: 50, backgroundColor: "rgba(255,255,255,0.9)", borderRadius: 16, paddingHorizontal: 16, paddingVertical: 10, borderWidth: 0.5, borderColor: "rgba(0,0,0,0.06)" },
  toastText: { fontSize: 14, color: "rgba(0,0,0,0.7)" },
  toastHighlight: { fontWeight: "600", color: "#000" },
  confirmContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.2)" },
  confirmDialog: { backgroundColor: "#fff", borderRadius: 24, padding: 24, width: "85%", maxWidth: 320, borderWidth: 0.5, borderColor: "rgba(0,0,0,0.05)" },
  confirmText: { fontSize: 14, textAlign: "center", color: "rgba(0,0,0,0.7)" },
  confirmHighlight: { fontWeight: "600", color: "#000" },
  confirmButtons: { flexDirection: "row", gap: 12, marginTop: 20 },
  confirmCancel: { flex: 1, backgroundColor: "rgba(0,0,0,0.05)", borderRadius: 16, paddingVertical: 10, alignItems: "center" },
  confirmCancelText: { fontSize: 14, color: "rgba(0,0,0,0.5)" },
  confirmOk: { flex: 1, backgroundColor: "#000", borderRadius: 16, paddingVertical: 10, alignItems: "center" },
  confirmOkText: { fontSize: 14, color: "#fff" },
  title: { fontSize: 24, fontWeight: "600", color: "#000", marginBottom: 20 },
  searchContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(0,0,0,0.05)", borderRadius: 16, height: 48 },
  searchIconWrapper: { position: "absolute", left: 16 },
  searchInput: { flex: 1, fontSize: 14, color: "#000", paddingLeft: 40, paddingRight: 80 },
  clearButton: { position: "absolute", right: 48 },
  searchButton: { position: "absolute", right: 12, padding: 8 },
  historyContainer: { marginTop: 24 },
  historyHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  historyTitle: { fontSize: 14, color: "rgba(0,0,0,0.4)" },
  historyClear: { fontSize: 12, color: "rgba(0,0,0,0.2)" },
  tagsContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: { backgroundColor: "rgba(0,0,0,0.05)", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 8 },
  tagText: { fontSize: 14, color: "rgba(0,0,0,0.6)" },
  hintText: { fontSize: 12, color: "rgba(0,0,0,0.15)", marginTop: 8 },
  resultsContainer: { marginTop: 20 },
  resultsCount: { fontSize: 14, color: "rgba(0,0,0,0.3)", marginBottom: 8 },
  resultItem: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: "rgba(0,0,0,0.05)" },
  resultCover: { width: 40, height: 40, borderRadius: 8, backgroundColor: "rgba(0,0,0,0.05)" },
  resultInfo: { flex: 1, minWidth: 0 },
  resultTitle: { fontSize: 14, color: "rgba(0,0,0,0.7)" },
  resultTitleActive: { color: "#000", fontWeight: "500" },
  resultArtist: { fontSize: 12, color: "rgba(0,0,0,0.35)", marginTop: 2 },
  emptyText: { fontSize: 14, color: "rgba(0,0,0,0.25)", textAlign: "center", paddingVertical: 48 },
})
