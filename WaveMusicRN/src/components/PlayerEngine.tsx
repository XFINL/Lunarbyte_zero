import { useEffect } from "react"
import { usePlayerStore } from "@/store/playerStore"
import { useUserStore } from "@/store/userStore"
import { initAudioEngine } from "@/lib/audio"

export default function PlayerEngine() {
  const { currentSong, isPlaying } = usePlayerStore()
  const { addRecentPlay } = useUserStore()

  useEffect(() => {
    initAudioEngine()
  }, [])

  useEffect(() => {
    if (isPlaying && currentSong) {
      addRecentPlay(currentSong)
    }
  }, [isPlaying, currentSong, addRecentPlay])

  return null
}