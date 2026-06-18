import React, { useState, useCallback, useEffect, useRef } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  StyleSheet,
} from "react-native"
import { useSearchStore } from "@/store/searchStore"
import { usePlayerStore } from "@/store/playerStore"
import { useUserStore } from "@/store/userStore"
import {
  IconSearch,
  IconClose,
  IconHeart,
  IconHeartFilled,
} from "@/components/Icons"
import type { Song } from "@/types"

export default function SearchPage() {
  const {
    query,
    setQuery,
    results,
    history,
    search,
    removeHistory,
    clearHistory,
    loading,
  } = useSearchStore()
  const { play, currentSong, togglePlay } = usePlayerStore()
  const { isFavorite, toggleFavorite, consumeSearch, canSearch } =
    useUserStore()

  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Delete single history tag
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // Clear all history
  const [showClearModal, setShowClearModal] = useState(false)

  const showToast = useCallback((msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast(msg)
    toastTimer.current = setTimeout(() => {
      setToast(null)
      toastTimer.current = null
    }, 1000)
  }, [])

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current)
    }
  }, [])

  const handleSearch = useCallback(async () => {
    const q = query.trim()
    if (!q) return
    if (!canSearch()) {
      showToast("今日搜索次数已用完")
      return
    }
    consumeSearch()
    await search(q)
  }, [query, canSearch, consumeSearch, search, showToast])

  const handleSongPress = useCallback(
    (song: Song) => {
      if (currentSong?.id === song.id) {
        togglePlay()
      } else {
        play(song)
        showToast(`已添加：${song.title}`)
      }
    },
    [currentSong, togglePlay, play, showToast],
  )

  const handleLongPressHistory = useCallback((keyword: string) => {
    setDeleteTarget(keyword)
    setShowDeleteModal(true)
  }, [])

  const confirmDeleteHistory = useCallback(() => {
    if (deleteTarget) {
      removeHistory(deleteTarget)
    }
    setShowDeleteModal(false)
    setDeleteTarget(null)
  }, [deleteTarget, removeHistory])

  const confirmClearHistory = useCallback(() => {
    clearHistory()
    setShowClearModal(false)
  }, [clearHistory])

  return (
    <View style={styles.container}>
      {/* Toast */}
      {toast !== null && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      )}

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <View style={styles.searchInputWrapper}>
          <IconSearch size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="搜索歌曲"
            placeholderTextColor="#999"
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")}>
              <IconClose size={18} color="#999" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>搜索</Text>
        </TouchableOpacity>
      </View>

      {query.trim().length === 0 ? (
        /* History Tags */
        <View style={styles.historySection}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>搜索历史</Text>
            {history.length > 0 && (
              <TouchableOpacity onPress={() => setShowClearModal(true)}>
                <Text style={styles.clearText}>清空</Text>
              </TouchableOpacity>
            )}
          </View>
          {history.length === 0 ? (
            <Text style={styles.emptyText}>暂无搜索历史</Text>
          ) : (
            <View style={styles.tagsContainer}>
              {history.map((keyword) => (
                <TouchableOpacity
                  key={keyword}
                  style={styles.tag}
                  onPress={() => {
                    setQuery(keyword)
                    handleSearch()
                  }}
                  onLongPress={() => handleLongPressHistory(keyword)}
                >
                  <Text style={styles.tagText}>{keyword}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      ) : (
        /* Search Results */
        <ScrollView style={styles.resultsList}>
          {loading ? (
            <Text style={styles.loadingText}>搜索中...</Text>
          ) : results.length === 0 ? (
            <Text style={styles.emptyText}>未找到相关歌曲</Text>
          ) : (
            results.map((song) => {
              const favorited = isFavorite(song.id)
              return (
                <TouchableOpacity
                  key={song.id}
                  style={styles.resultItem}
                  onPress={() => handleSongPress(song)}
                  activeOpacity={0.7}
                >
                  <Image
                    source={{ uri: song.cover }}
                    style={styles.cover}
                  />
                  <View style={styles.songInfo}>
                    <Text style={styles.songTitle} numberOfLines={1}>
                      {song.title}
                    </Text>
                    <Text style={styles.songArtist} numberOfLines={1}>
                      {song.artist}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.favoriteButton}
                    onPress={() => toggleFavorite(song)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    {favorited ? (
                      <IconHeartFilled size={22} color="#e74c3c" />
                    ) : (
                      <IconHeart size={22} color="#999" />
                    )}
                  </TouchableOpacity>
                </TouchableOpacity>
              )
            })
          )}
        </ScrollView>
      )}

      {/* Delete History Confirm Modal */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>删除历史</Text>
            <Text style={styles.modalMessage}>
              确定要删除"{deleteTarget}"吗？
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={styles.modalCancelText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={confirmDeleteHistory}
              >
                <Text style={styles.modalConfirmText}>删除</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Clear All History Confirm Modal */}
      <Modal
        visible={showClearModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowClearModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>清空历史</Text>
            <Text style={styles.modalMessage}>确定要清空所有搜索历史吗？</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowClearModal(false)}
              >
                <Text style={styles.modalCancelText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={confirmClearHistory}
              >
                <Text style={styles.modalConfirmText}>清空</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },

  // Toast
  toast: {
    position: "absolute",
    top: 60,
    left: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    zIndex: 999,
  },
  toastText: {
    color: "#fff",
    fontSize: 14,
  },

  // Search Bar
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  searchInput: {
    flex: 1,
    color: "#fff",
    fontSize: 15,
    marginLeft: 8,
    marginRight: 8,
    paddingVertical: 0,
  },
  searchButton: {
    marginLeft: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  searchButtonText: {
    color: "#000",
    fontSize: 15,
    fontWeight: "600",
  },

  // History
  historySection: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  historyTitle: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },
  clearText: {
    color: "#999",
    fontSize: 14,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  tag: {
    backgroundColor: "#1a1a1a",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  },
  tagText: {
    color: "#ccc",
    fontSize: 14,
  },

  // Results
  resultsList: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  loadingText: {
    color: "#999",
    fontSize: 14,
    textAlign: "center",
    marginTop: 40,
  },
  emptyText: {
    color: "#666",
    fontSize: 14,
    textAlign: "center",
    marginTop: 40,
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#222",
  },
  cover: {
    width: 48,
    height: 48,
    borderRadius: 6,
    backgroundColor: "#222",
  },
  songInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 12,
  },
  songTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 4,
  },
  songArtist: {
    color: "#999",
    fontSize: 13,
  },
  favoriteButton: {
    padding: 4,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 24,
    width: "80%",
    maxWidth: 320,
  },
  modalTitle: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 12,
  },
  modalMessage: {
    color: "#ccc",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  modalCancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: "#333",
  },
  modalCancelText: {
    color: "#ccc",
    fontSize: 14,
  },
  modalConfirmButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: "#e74c3c",
  },
  modalConfirmText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
})