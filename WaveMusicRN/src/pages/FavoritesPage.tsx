import React, { useState, useMemo } from "react"
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { useUserStore } from "@/store/userStore"
import { usePlayerStore } from "@/store/playerStore"
import {
  IconHeartFilled,
  IconArrowLeft,
  IconArrowRight,
} from "@/components/Icons"
import type { Song } from "@/types"

const PAGE_SIZE = 7

export default function FavoritesPage() {
  const navigation = useNavigation()
  const { favorites } = useUserStore()
  const { play, currentSong, isPlaying, togglePlay } = usePlayerStore()

  const [page, setPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(favorites.length / PAGE_SIZE))

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return favorites.slice(start, start + PAGE_SIZE)
  }, [favorites, page])

  const handlePrev = () => {
    if (page > 1) setPage(page - 1)
  }

  const handleNext = () => {
    if (page < totalPages) setPage(page + 1)
  }

  const handleSongPress = (song: Song) => {
    if (currentSong?.id === song.id) {
      togglePlay()
    } else {
      play(song)
    }
  }

  const isCurrentPlaying = (song: Song) =>
    currentSong?.id === song.id && isPlaying

  const renderItem = ({ item }: { item: Song }) => (
    <TouchableOpacity
      style={[
        styles.songItem,
        currentSong?.id === item.id && styles.songItemActive,
      ]}
      onPress={() => handleSongPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.coverWrapper}>
        <View style={styles.coverPlaceholder} />
      </View>
      <View style={styles.songInfo}>
        <Text style={styles.songTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.songArtist} numberOfLines={1}>
          {item.artist}
        </Text>
      </View>
      {isCurrentPlaying(item) && (
        <IconHeartFilled size={20} color="#ff4757" />
      )}
    </TouchableOpacity>
  )

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
        <Text style={styles.headerTitle}>点赞列表</Text>
        <View style={styles.headerRight} />
      </View>

      {favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <IconHeartFilled size={48} color="#333" />
          <Text style={styles.emptyText}>还没有收藏的歌曲</Text>
          <Text style={styles.emptySubText}>去发现喜欢的音乐吧</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={paginatedItems}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />

          {/* Pagination */}
          <View style={styles.pagination}>
            <TouchableOpacity
              style={[styles.pageButton, page <= 1 && styles.pageButtonDisabled]}
              onPress={handlePrev}
              disabled={page <= 1}
            >
              <IconArrowLeft
                size={20}
                color={page <= 1 ? "#555" : "#fff"}
              />
              <Text
                style={[
                  styles.pageButtonText,
                  page <= 1 && styles.pageButtonTextDisabled,
                ]}
              >
                上一页
              </Text>
            </TouchableOpacity>

            <Text style={styles.pageInfo}>
              {page} / {totalPages}
            </Text>

            <TouchableOpacity
              style={[
                styles.pageButton,
                page >= totalPages && styles.pageButtonDisabled,
              ]}
              onPress={handleNext}
              disabled={page >= totalPages}
            >
              <Text
                style={[
                  styles.pageButtonText,
                  page >= totalPages && styles.pageButtonTextDisabled,
                ]}
              >
                下一页
              </Text>
              <IconArrowRight
                size={20}
                color={page >= totalPages ? "#555" : "#fff"}
              />
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  headerRight: {
    width: 32,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  songItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 4,
  },
  songItemActive: {
    backgroundColor: "#1a1a1a",
  },
  coverWrapper: {
    marginRight: 12,
  },
  coverPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#333",
  },
  songInfo: {
    flex: 1,
    marginRight: 8,
  },
  songTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 2,
  },
  songArtist: {
    color: "#888",
    fontSize: 13,
  },
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 16,
  },
  pageButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#1a1a1a",
  },
  pageButtonDisabled: {
    backgroundColor: "#111",
  },
  pageButtonText: {
    color: "#fff",
    fontSize: 14,
  },
  pageButtonTextDisabled: {
    color: "#555",
  },
  pageInfo: {
    color: "#aaa",
    fontSize: 14,
    minWidth: 48,
    textAlign: "center",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 80,
  },
  emptyText: {
    color: "#666",
    fontSize: 16,
    marginTop: 16,
  },
  emptySubText: {
    color: "#444",
    fontSize: 13,
    marginTop: 6,
  },
})