import React, { useRef, useCallback, useState, useEffect } from "react"
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal,
  Animated,
  PanResponder,
  StyleSheet,
  Dimensions,
  StatusBar,
} from "react-native"
import Slider from "@react-native-community/slider"
import { usePlayerStore } from "@/store/playerStore"
import { useUserStore } from "@/store/userStore"
import {
  IconList,
  IconClose,
  IconMusic,
  IconPlay,
  IconHeart,
  IconHeartFilled,
  IconSkipPrev,
  IconSkipNext,
} from "@/components/Icons"
import { formatTime, type Song } from "@/types"

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window")
const COVER_SIZE = SCREEN_WIDTH * 0.7
const SWIPE_THRESHOLD = 50
const DEFAULT_SONG_ID = "__default__"

export default function HomePage() {
  const {
    currentSong,
    isPlaying,
    progress,
    playlist,
    next,
    prev,
    setProgress,
    removeFromPlaylist,
    clearPlaylist,
    play,
    resumeFromPlaylist,
  } = usePlayerStore()
  const { isFavorite, toggleFavorite } = useUserStore()

  const [playlistVisible, setPlaylistVisible] = useState(false)
  const [confirmVisible, setConfirmVisible] = useState(false)
  const [songToRemove, setSongToRemove] = useState<string | null>(null)

  // Animated value for swipe gesture
  const swipeAnim = useRef(new Animated.Value(0)).current
  // Animated value for playlist slide-down
  const playlistSlideAnim = useRef(new Animated.Value(-SCREEN_HEIGHT)).current

  // Filtered playlist for display (hide default song)
  const displayPlaylist = playlist.filter((s) => s.id !== DEFAULT_SONG_ID)

  // Animate playlist modal from top
  useEffect(() => {
    if (playlistVisible) {
      Animated.timing(playlistSlideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start()
    } else {
      Animated.timing(playlistSlideAnim, {
        toValue: -SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start()
    }
  }, [playlistVisible, playlistSlideAnim])

  // PanResponder for swipe up/down to switch songs
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return (
          Math.abs(gestureState.dy) > 10 &&
          Math.abs(gestureState.dx) < Math.abs(gestureState.dy) * 1.5
        )
      },
      onPanResponderMove: (_, gestureState) => {
        swipeAnim.setValue(gestureState.dy)
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy < -SWIPE_THRESHOLD) {
          next()
        } else if (gestureState.dy > SWIPE_THRESHOLD) {
          prev()
        }
        Animated.spring(swipeAnim, {
          toValue: 0,
          friction: 6,
          useNativeDriver: true,
        }).start()
      },
      onPanResponderTerminate: () => {
        Animated.spring(swipeAnim, {
          toValue: 0,
          friction: 6,
          useNativeDriver: true,
        }).start()
      },
    }),
  ).current

  // ---------- Handlers ----------
  const handlePlayPause = useCallback(() => {
    if (!currentSong || currentSong.id === DEFAULT_SONG_ID) {
      resumeFromPlaylist()
      return
    }
    if (isPlaying) {
      usePlayerStore.getState().pause()
    } else {
      play()
    }
  }, [currentSong, isPlaying, play, resumeFromPlaylist])

  const handleRemovePress = useCallback((songId: string) => {
    setSongToRemove(songId)
    setConfirmVisible(true)
  }, [])

  const handleConfirmRemove = useCallback(() => {
    if (songToRemove) {
      removeFromPlaylist(songToRemove)
    }
    setConfirmVisible(false)
    setSongToRemove(null)
  }, [songToRemove, removeFromPlaylist])

  const handleCancelRemove = useCallback(() => {
    setConfirmVisible(false)
    setSongToRemove(null)
  }, [])

  const handleClearPlaylist = useCallback(() => {
    setPlaylistVisible(false)
    clearPlaylist()
  }, [clearPlaylist])

  const handleSelectFromPlaylist = useCallback(
    (songId: string) => {
      const song = playlist.find((s) => s.id === songId)
      if (song) {
        play(song)
      }
    },
    [playlist, play],
  )

  const handleToggleFavorite = useCallback(
    (song: Song) => {
      toggleFavorite(song)
    },
    [toggleFavorite],
  )

  // ---------- Derived values ----------
  const duration = currentSong?.duration ?? 0
  const progressSeconds = duration > 0 ? (progress / 100) * duration : 0
  const coverUri = currentSong?.cover ?? ""
  const songTitle = currentSong?.title ?? ""
  const songArtist = currentSong?.artist ?? ""
  const isDefault = !currentSong || currentSong.id === DEFAULT_SONG_ID
  const hasPlaylist = displayPlaylist.length > 0

  // Animated style for album cover during swipe
  const coverAnimatedStyle = {
    transform: [
      {
        translateY: swipeAnim.interpolate({
          inputRange: [-SCREEN_HEIGHT, 0, SCREEN_HEIGHT],
          outputRange: [-120, 0, 120],
          extrapolate: "clamp",
        }),
      },
      {
        scale: swipeAnim.interpolate({
          inputRange: [-200, 0, 200],
          outputRange: [0.85, 1, 0.85],
          extrapolate: "clamp",
        }),
      },
    ],
    opacity: swipeAnim.interpolate({
      inputRange: [-200, 0, 200],
      outputRange: [0.6, 1, 0.6],
      extrapolate: "clamp",
    }),
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Wave Music</Text>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => setPlaylistVisible(true)}
          activeOpacity={0.7}
        >
          <IconList size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Main content area with swipe gesture */}
      <View style={styles.mainContent} {...panResponder.panHandlers}>
        {/* Album cover */}
        <Animated.View style={[styles.coverContainer, coverAnimatedStyle]}>
          {coverUri ? (
            <Image source={{ uri: coverUri }} style={styles.coverImage} />
          ) : (
            <View style={[styles.coverImage, styles.coverPlaceholder]}>
              <IconMusic size={60} color="#555" />
            </View>
          )}
        </Animated.View>

        {/* Song info */}
        <View style={styles.songInfo}>
          <Text style={styles.songTitle} numberOfLines={1}>
            {isDefault ? "未选择歌曲" : songTitle}
          </Text>
          <Text style={styles.songArtist} numberOfLines={1}>
            {isDefault ? "点击播放开始欣赏" : songArtist}
          </Text>
        </View>

        {/* Progress slider */}
        <View style={styles.progressContainer}>
          <Text style={styles.timeText}>{formatTime(progressSeconds)}</Text>
          <Slider
            style={styles.slider}
            value={progress}
            onValueChange={setProgress}
            minimumValue={0}
            maximumValue={100}
            minimumTrackTintColor="#ffffff"
            maximumTrackTintColor="#444444"
            thumbTintColor="#ffffff"
            disabled={isDefault}
          />
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>

        {/* Control buttons */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={prev}
            disabled={!hasPlaylist}
            activeOpacity={0.6}
          >
            <IconSkipPrev
              size={32}
              color={hasPlaylist ? "#ffffff" : "#444444"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.playButton, isDefault && styles.playButtonDisabled]}
            onPress={handlePlayPause}
            activeOpacity={0.8}
          >
            <IconPlay size={36} color="#000000" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={next}
            disabled={!hasPlaylist}
            activeOpacity={0.6}
          >
            <IconSkipNext
              size={32}
              color={hasPlaylist ? "#ffffff" : "#444444"}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Playlist Modal - slides down from top */}
      <Modal
        visible={playlistVisible}
        transparent={true}
        animationType="none"
        onRequestClose={() => setPlaylistVisible(false)}
      >
        <View style={styles.playlistModalOverlay}>
          <TouchableOpacity
            style={styles.playlistModalBackdrop}
            activeOpacity={1}
            onPress={() => setPlaylistVisible(false)}
          />
          <Animated.View
            style={[
              styles.playlistModalContent,
              { transform: [{ translateY: playlistSlideAnim }] },
            ]}
          >
            <View style={styles.playlistModalHandle} />
            <View style={styles.playlistModalHeader}>
              <Text style={styles.playlistModalTitle}>播放列表</Text>
              <View style={styles.playlistModalHeaderRight}>
                {hasPlaylist && (
                  <TouchableOpacity
                    style={styles.clearButton}
                    onPress={handleClearPlaylist}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.clearButtonText}>清空</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setPlaylistVisible(false)}
                  activeOpacity={0.7}
                >
                  <IconClose size={22} color="#ffffff" />
                </TouchableOpacity>
              </View>
            </View>

            {displayPlaylist.length === 0 ? (
              <View style={styles.emptyPlaylist}>
                <IconMusic size={48} color="#444444" />
                <Text style={styles.emptyText}>播放列表为空</Text>
                <Text style={styles.emptySubText}>搜索并添加你喜欢的歌曲</Text>
              </View>
            ) : (
              <ScrollView
                style={styles.playlistScroll}
                contentContainerStyle={styles.playlistScrollContent}
                showsVerticalScrollIndicator={false}
              >
                {displayPlaylist.map((song) => {
                  const isCurrent = song.id === currentSong?.id
                  const isFavItem = isFavorite(song.id)
                  return (
                    <View
                      key={song.id}
                      style={[
                        styles.playlistItemRow,
                        isCurrent && styles.playlistItemRowActive,
                      ]}
                    >
                      <TouchableOpacity
                        style={styles.playlistItemTouchable}
                        onPress={() => handleSelectFromPlaylist(song.id)}
                        activeOpacity={0.7}
                      >
                        <Image
                          source={{ uri: song.cover }}
                          style={styles.playlistItemCover}
                        />
                        <View style={styles.playlistItemInfo}>
                          <Text
                            style={[
                              styles.playlistItemTitle,
                              isCurrent && styles.playlistItemTitleActive,
                            ]}
                            numberOfLines={1}
                          >
                            {song.title}
                          </Text>
                          <Text
                            style={styles.playlistItemArtist}
                            numberOfLines={1}
                          >
                            {song.artist}
                          </Text>
                        </View>
                      </TouchableOpacity>
                      <View style={styles.playlistItemActions}>
                        <TouchableOpacity
                          style={styles.favoriteButton}
                          onPress={() => handleToggleFavorite(song)}
                          activeOpacity={0.7}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          {isFavItem ? (
                            <IconHeartFilled size={20} color="#ff4757" />
                          ) : (
                            <IconHeart size={20} color="#888888" />
                          )}
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.removeButton}
                          onPress={() => handleRemovePress(song.id)}
                          activeOpacity={0.7}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <IconClose size={18} color="#666666" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  )
                })}
              </ScrollView>
            )}
          </Animated.View>
        </View>
      </Modal>

      {/* Confirm remove dialog modal */}
      <Modal
        visible={confirmVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelRemove}
      >
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmDialog}>
            <Text style={styles.confirmTitle}>确认移除</Text>
            <Text style={styles.confirmMessage}>
              确定要从播放列表中移除该歌曲吗？
            </Text>
            <View style={styles.confirmActions}>
              <TouchableOpacity
                style={styles.confirmCancelButton}
                onPress={handleCancelRemove}
                activeOpacity={0.7}
              >
                <Text style={styles.confirmCancelText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmDeleteButton}
                onPress={handleConfirmRemove}
                activeOpacity={0.7}
              >
                <Text style={styles.confirmDeleteText}>移除</Text>
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
    backgroundColor: "#000000",
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: 1,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1a1a1a",
    alignItems: "center",
    justifyContent: "center",
  },

  // Main content
  mainContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 40,
  },

  // Album cover
  coverContainer: {
    width: COVER_SIZE,
    height: COVER_SIZE,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#ffffff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  coverImage: {
    width: COVER_SIZE,
    height: COVER_SIZE,
    borderRadius: 16,
  },
  coverPlaceholder: {
    backgroundColor: "#1a1a1a",
    alignItems: "center",
    justifyContent: "center",
  },

  // Song info
  songInfo: {
    alignItems: "center",
    marginTop: 30,
    paddingHorizontal: 40,
  },
  songTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#ffffff",
    textAlign: "center",
  },
  songArtist: {
    fontSize: 15,
    color: "#888888",
    marginTop: 6,
    textAlign: "center",
  },

  // Progress slider
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: SCREEN_WIDTH - 60,
    marginTop: 30,
  },
  slider: {
    flex: 1,
    height: 40,
    marginHorizontal: 8,
  },
  timeText: {
    fontSize: 12,
    color: "#888888",
    width: 42,
    textAlign: "center",
  },

  // Controls
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    gap: 30,
  },
  controlButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#ffffff",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  playButtonDisabled: {
    backgroundColor: "#333333",
  },

  // Playlist Modal
  playlistModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  playlistModalBackdrop: {
    flex: 1,
  },
  playlistModalContent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "#1a1a1a",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.75,
    paddingTop: 12,
  },
  playlistModalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#444444",
    alignSelf: "center",
    marginBottom: 8,
  },
  playlistModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  playlistModalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ffffff",
  },
  playlistModalHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#333333",
  },
  clearButtonText: {
    fontSize: 13,
    color: "#ff6b6b",
    fontWeight: "600",
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#333333",
    alignItems: "center",
    justifyContent: "center",
  },

  // Playlist items
  emptyPlaylist: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: "#888888",
    marginTop: 16,
    fontWeight: "600",
  },
  emptySubText: {
    fontSize: 13,
    color: "#555555",
    marginTop: 6,
  },
  playlistScroll: {
    flexGrow: 0,
  },
  playlistScrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  playlistItemRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#222222",
    borderRadius: 12,
    marginBottom: 8,
    paddingRight: 8,
  },
  playlistItemRowActive: {
    backgroundColor: "#2a2a2a",
    borderWidth: 1,
    borderColor: "#ffffff",
  },
  playlistItemTouchable: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  playlistItemCover: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#333333",
  },
  playlistItemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  playlistItemTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#ffffff",
  },
  playlistItemTitleActive: {
    color: "#ffffff",
  },
  playlistItemArtist: {
    fontSize: 12,
    color: "#888888",
    marginTop: 2,
  },
  playlistItemActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  favoriteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  removeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  // Confirm dialog
  confirmOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  confirmDialog: {
    width: "100%",
    backgroundColor: "#222222",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 12,
  },
  confirmMessage: {
    fontSize: 14,
    color: "#999999",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  confirmActions: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  confirmCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#333333",
    alignItems: "center",
    justifyContent: "center",
  },
  confirmCancelText: {
    fontSize: 15,
    color: "#ffffff",
    fontWeight: "600",
  },
  confirmDeleteButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#ff4757",
    alignItems: "center",
    justifyContent: "center",
  },
  confirmDeleteText: {
    fontSize: 15,
    color: "#ffffff",
    fontWeight: "600",
  },
})