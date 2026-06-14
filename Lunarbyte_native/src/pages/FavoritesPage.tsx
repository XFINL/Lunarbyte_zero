import { StyleSheet, View, Text, TouchableOpacity, Image, FlatList } from "react-native"
import { useState } from "react"
import { useNavigation } from "@react-navigation/native"
import { useUserStore } from "@/store/userStore"
import { usePlayerStore } from "@/store/playerStore"
import { IconHeartFilled, IconArrowLeft, IconArrowRight } from "@/components/Icons"

const PAGE_SIZE = 7

export default function FavoritesPage() {
  const { favorites } = useUserStore()
  const { play, currentSong, togglePlay } = usePlayerStore()
  const navigation = useNavigation<any>()
  const [page, setPage] = useState(0)

  const totalPages = Math.max(1, Math.ceil(favorites.length / PAGE_SIZE))
  const start = page * PAGE_SIZE
  const visible = favorites.slice(start, start + PAGE_SIZE)

  const handlePlaySong = (song: (typeof favorites)[0]) => {
    if (currentSong?.id === song.id) {
      togglePlay()
    } else {
      play(song)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <IconArrowLeft size={22} color="rgba(0,0,0,0.3)" />
        </TouchableOpacity>
        <Text style={styles.title}>点赞列表</Text>
      </View>

      {favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <IconHeartFilled size={48} color="rgba(0,0,0,0.2)" />
          <Text style={styles.emptyText}>还没有收藏的歌曲</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={visible}
            keyExtractor={(item) => item.id}
            renderItem={({ item: song }) => {
              const isActive = currentSong?.id === song.id
              return (
                <TouchableOpacity
                  style={styles.songItem}
                  onPress={() => handlePlaySong(song)}
                >
                  <Image source={{ uri: song.cover }} style={styles.songCover} />
                  <View style={styles.songInfo}>
                    <Text style={[styles.songTitle, isActive && styles.songTitleActive]} numberOfLines={1}>
                      {song.title}
                    </Text>
                    <Text style={styles.songArtist} numberOfLines={1}>{song.artist}</Text>
                  </View>
                  {isActive && <IconHeartFilled size={14} color="rgba(0,0,0,0.4)" />}
                </TouchableOpacity>
              )
            }}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />

          {totalPages > 1 && (
            <View style={styles.pagination}>
              <TouchableOpacity
                style={[styles.pageButton, page === 0 && styles.pageButtonDisabled]}
                onPress={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
              >
                <IconArrowLeft size={18} color={page === 0 ? "rgba(0,0,0,0.1)" : "rgba(0,0,0,0.3)"} />
              </TouchableOpacity>
              <Text style={styles.pageText}>{page + 1} / {totalPages}</Text>
              <TouchableOpacity
                style={[styles.pageButton, page >= totalPages - 1 && styles.pageButtonDisabled]}
                onPress={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
              >
                <IconArrowRight size={18} color={page >= totalPages - 1 ? "rgba(0,0,0,0.1)" : "rgba(0,0,0,0.3)"} />
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 20, paddingTop: 56, paddingBottom: 112 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 20 },
  title: { fontSize: 24, fontWeight: "600", color: "#000" },
  emptyContainer: { alignItems: "center", paddingTop: 64 },
  emptyText: { fontSize: 14, color: "rgba(0,0,0,0.3)", marginTop: 16 },
  songItem: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 },
  songCover: { width: 40, height: 40, borderRadius: 8, backgroundColor: "rgba(0,0,0,0.05)" },
  songInfo: { flex: 1, minWidth: 0 },
  songTitle: { fontSize: 14, color: "rgba(0,0,0,0.7)" },
  songTitleActive: { color: "#000", fontWeight: "500" },
  songArtist: { fontSize: 12, color: "rgba(0,0,0,0.35)", marginTop: 2 },
  separator: { height: 0.5, backgroundColor: "rgba(0,0,0,0.05)" },
  pagination: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 16, marginTop: 24 },
  pageButton: { padding: 8, borderRadius: 12 },
  pageButtonDisabled: { opacity: 0.2 },
  pageText: { fontSize: 14, color: "rgba(0,0,0,0.4)" },
})
