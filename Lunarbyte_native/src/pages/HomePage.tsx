import { StyleSheet, View, Text, Image, TouchableOpacity, Modal, Dimensions } from "react-native"
import { useState, useRef, useEffect, useCallback } from "react"
import { usePlayerStore } from "@/store/playerStore"
import { useUserStore } from "@/store/userStore"
import { formatTime } from "@/data/mock"
import { IconList, IconClose, IconMusic, IconPlay, IconHeart, IconHeartFilled } from "@/components/Icons"
import { GestureHandlerRootView, Gesture, GestureDetector } from "react-native-gesture-handler"

const SCREEN_HEIGHT = Dimensions.get("window").height

export default function HomePage() {
  const {
    currentSong, isPlaying, progress, playlist,
    next, prev, setProgress, removeFromPlaylist, clearPlaylist, play, resumeFromPlaylist,
  } = usePlayerStore()
  const { isFavorite, toggleFavorite } = useUserStore()

  useEffect(() => {
    resumeFromPlaylist()
  }, [resumeFromPlaylist])

  const [swiping, setSwiping] = useState<"up" | "down" | null>(null)
  const [showPlaylist, setShowPlaylist] = useState(false)
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null)
  const [confirmClearAll, setConfirmClearAll] = useState(false)
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const displaySong = currentSong ?? playlist[0]
  const currentDuration = Math.floor((progress / 100) * (displaySong?.duration ?? 0))

  const handleItemTouchStart = (songId: string) => {
    longPressTimer.current = setTimeout(() => {
      setConfirmRemove(songId)
    }, 500)
  }
  const handleItemTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }

  // 滑动手势
  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      const diff = e.translationY
      if (Math.abs(diff) > 30) {
        setSwiping(diff < 0 ? "up" : "down")
      } else {
        setSwiping(null)
      }
    })
    .onEnd((e) => {
      const diff = e.translationY
      const threshold = 60
      if (diff < -threshold) {
        next()
      } else if (diff > threshold) {
        prev()
      }
      setSwiping(null)
    })

  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={panGesture}>
        <View style={styles.content}>
          {/* 播放列表按钮 */}
          <TouchableOpacity
            style={styles.playlistButton}
            onPress={() => setShowPlaylist(true)}
          >
            <IconList size={22} color="rgba(0,0,0,0.4)" />
          </TouchableOpacity>

          {/* 滑动提示 */}
          <Text style={[styles.swipeIndicator, { opacity: swiping === "up" ? 1 : 0, top: 32 }]}>
            下一首
          </Text>
          <Text style={[styles.swipeIndicator, { opacity: swiping === "down" ? 1 : 0, bottom: 192 }]}>
            上一首
          </Text>

          {/* 专辑封面 */}
          <View style={styles.coverContainer}>
            <View style={styles.coverShadow} />
            <Image
              source={{ uri: displaySong?.cover }}
              style={styles.coverImage}
            />
          </View>

          {/* 歌曲信息 */}
          <View style={styles.songInfo}>
            <Text style={styles.songTitle}>{displaySong?.title}</Text>
            <Text style={styles.songArtist}>{displaySong?.artist}</Text>
          </View>

          {/* 进度条 */}
          <View style={styles.progressContainer}>
            <View style={styles.progressTrack} onTouchStart={() => {}}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
              <View style={[styles.progressThumb, { left: `${progress}%` }]} />
            </View>
            <View style={styles.timeRow}>
              <Text style={styles.timeText}>{formatTime(currentDuration)}</Text>
              <Text style={styles.timeText}>{formatTime(displaySong?.duration ?? 0)}</Text>
            </View>
          </View>
        </View>
      </GestureDetector>

      {/* 播放列表弹窗 */}
      <Modal visible={showPlaylist} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.modalBackdrop} onPress={() => setShowPlaylist(false)} />
          <View style={styles.playlistPanel}>
            <View style={styles.playlistHeader}>
              <Text style={styles.playlistTitle}>播放列表（{playlist.length}）</Text>
              <View style={styles.playlistActions}>
                {playlist.length > 0 && (
                  <TouchableOpacity onPress={() => setConfirmClearAll(true)}>
                    <Text style={styles.clearText}>全部移除</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => setShowPlaylist(false)}>
                  <IconClose size={18} color="rgba(0,0,0,0.3)" />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.playlistList}>
              {playlist.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <IconMusic size={40} color="rgba(0,0,0,0.2)" />
                  <Text style={styles.emptyText}>播放列表为空</Text>
                </View>
              ) : (
                playlist.map((song) => {
                  const isActive = currentSong?.id === song.id
                  return (
                    <TouchableOpacity
                      key={song.id}
                      style={[styles.playlistItem, isActive && styles.playlistItemActive]}
                      onPress={() => { play(song); setShowPlaylist(false) }}
                      onTouchStart={() => handleItemTouchStart(song.id)}
                      onTouchEnd={handleItemTouchEnd}
                    >
                      <Image source={{ uri: song.cover }} style={styles.playlistCover} />
                      <View style={styles.playlistItemInfo}>
                        <Text style={[styles.playlistItemTitle, isActive && { color: "#000" }]} numberOfLines={1}>
                          {song.title}
                        </Text>
                        <Text style={styles.playlistItemArtist} numberOfLines={1}>{song.artist}</Text>
                      </View>
                      <TouchableOpacity
                        onPress={(e) => { e.stopPropagation(); toggleFavorite(song) }}
                      >
                        {isFavorite(song.id)
                          ? <IconHeartFilled size={14} color="#000" />
                          : <IconHeart size={14} color="rgba(0,0,0,0.2)" />
                        }
                      </TouchableOpacity>
                    </TouchableOpacity>
                  )
                })
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* 确认弹窗 - 移除单曲 */}
      <Modal visible={!!confirmRemove} transparent animationType="fade">
        <View style={styles.confirmContainer}>
          <View style={styles.confirmDialog}>
            <Text style={styles.confirmText}>是否从播放列表中移除该歌曲？</Text>
            <View style={styles.confirmButtons}>
              <TouchableOpacity style={styles.confirmCancel} onPress={() => setConfirmRemove(null)}>
                <Text style={styles.confirmCancelText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmOk}
                onPress={() => { removeFromPlaylist(confirmRemove!); setConfirmRemove(null) }}
              >
                <Text style={styles.confirmOkText}>移除</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 确认弹窗 - 清空 */}
      <Modal visible={confirmClearAll} transparent animationType="fade">
        <View style={styles.confirmContainer}>
          <View style={styles.confirmDialog}>
            <Text style={styles.confirmText}>确定要清空播放列表吗？</Text>
            <View style={styles.confirmButtons}>
              <TouchableOpacity style={styles.confirmCancel} onPress={() => setConfirmClearAll(false)}>
                <Text style={styles.confirmCancelText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmOk}
                onPress={() => { clearPlaylist(); setConfirmClearAll(false); setShowPlaylist(false) }}
              >
                <Text style={styles.confirmOkText}>清空</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { flex: 1, alignItems: "center", paddingHorizontal: 32, paddingTop: 48 },
  playlistButton: { position: "absolute", top: 16, left: 16, padding: 8, elevation: 10 },
  swipeIndicator: { position: "absolute", left: "50%", marginLeft: -24, fontSize: 12, color: "rgba(0,0,0,0.2)", fontWeight: "500" },
  coverContainer: { alignItems: "center", justifyContent: "center", width: "100%", marginTop: 24 },
  coverShadow: { position: "absolute", inset: -8, backgroundColor: "rgba(0,0,0,0.05)", borderRadius: 16, filter: "blur(24px)" as any },
  coverImage: { width: 288, height: 288, borderRadius: 16 },
  songInfo: { width: "100%", alignItems: "center", marginTop: 20 },
  songTitle: { fontSize: 24, fontWeight: "600", color: "#000", letterSpacing: -0.5 },
  songArtist: { fontSize: 16, color: "rgba(0,0,0,0.4)", marginTop: 4 },
  progressContainer: { width: "100%", marginTop: 20 },
  progressTrack: { height: 6, backgroundColor: "rgba(0,0,0,0.06)", borderRadius: 3, overflow: "visible" },
  progressFill: { height: 6, backgroundColor: "#000", borderRadius: 3 },
  progressThumb: { position: "absolute", top: -5, width: 16, height: 16, borderRadius: 8, backgroundColor: "#000", marginLeft: -8, shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 4 },
  timeRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 8, paddingHorizontal: 4 },
  timeText: { fontSize: 12, color: "rgba(0,0,0,0.3)" },
  modalContainer: { flex: 1 },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.2)" },
  playlistPanel: { backgroundColor: "#fff", borderBottomLeftRadius: 24, borderBottomRightRadius: 24, maxHeight: SCREEN_HEIGHT * 0.7, paddingBottom: 20 },
  playlistHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12 },
  playlistTitle: { fontSize: 16, fontWeight: "600", color: "#000" },
  playlistActions: { flexDirection: "row", alignItems: "center", gap: 12 },
  clearText: { fontSize: 12, color: "rgba(0,0,0,0.3)" },
  playlistList: { paddingHorizontal: 20, flex: 1 },
  emptyContainer: { alignItems: "center", justifyContent: "center", paddingVertical: 48 },
  emptyText: { fontSize: 14, color: "rgba(0,0,0,0.2)", marginTop: 12 },
  playlistItem: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, marginBottom: 4 },
  playlistItemActive: { backgroundColor: "rgba(0,0,0,0.05)" },
  playlistCover: { width: 36, height: 36, borderRadius: 8, backgroundColor: "rgba(0,0,0,0.05)" },
  playlistItemInfo: { flex: 1, minWidth: 0 },
  playlistItemTitle: { fontSize: 14, fontWeight: "500", color: "rgba(0,0,0,0.7)" },
  playlistItemArtist: { fontSize: 12, color: "rgba(0,0,0,0.35)", marginTop: 2 },
  confirmContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.2)" },
  confirmDialog: { backgroundColor: "#fff", borderRadius: 24, padding: 24, width: "85%", maxWidth: 320, borderWidth: 0.5, borderColor: "rgba(0,0,0,0.05)" },
  confirmText: { fontSize: 14, textAlign: "center", color: "rgba(0,0,0,0.7)" },
  confirmButtons: { flexDirection: "row", gap: 12, marginTop: 20 },
  confirmCancel: { flex: 1, backgroundColor: "rgba(0,0,0,0.05)", borderRadius: 16, paddingVertical: 10, alignItems: "center" },
  confirmCancelText: { fontSize: 14, color: "rgba(0,0,0,0.5)" },
  confirmOk: { flex: 1, backgroundColor: "#000", borderRadius: 16, paddingVertical: 10, alignItems: "center" },
  confirmOkText: { fontSize: 14, color: "#fff" },
})
