import { Audio } from "expo-av"
import { usePlayerStore } from "@/store/playerStore"

let soundRef: Audio.Sound | null = null
let isInitialized = false

async function getAudio(): Promise<Audio.Sound> {
  if (!soundRef) {
    const { sound } = await Audio.Sound.createAsync(
      undefined,
      { shouldPlay: false, progressUpdateIntervalMillis: 500 },
      onPlaybackStatusUpdate
    )
    soundRef = sound
  }
  return soundRef
}

function onPlaybackStatusUpdate(status: Audio.PlaybackStatus) {
  if (!status.isLoaded) return
  const duration = status.durationMillis ?? 0
  const position = status.positionMillis ?? 0
  if (duration > 0) {
    const progress = (position / duration) * 100
    usePlayerStore.getState().setProgress(progress)
  }
  if (status.didJustFinish) {
    usePlayerStore.getState().next()
  }
}

export async function initAudioEngine() {
  if (isInitialized) return
  isInitialized = true

  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
    staysActiveInBackground: true,
    playsInSilentModeIOS: true,
    shouldDuckAndroid: true,
    playThroughEarpieceAndroid: false,
  })

  await getAudio()
}

export async function playAudio(url: string) {
  try {
    const audio = await getAudio()
    await audio.stopAsync()
    await audio.unloadAsync()
    const newSound = await Audio.Sound.createAsync(
      { uri: url },
      { shouldPlay: true, progressUpdateIntervalMillis: 500 },
      onPlaybackStatusUpdate
    )
    soundRef = newSound.sound
  } catch {
    // 静默处理
  }
}

export async function resumeAudio() {
  try {
    const audio = await getAudio()
    await audio.playAsync()
  } catch {
    // 静默处理
  }
}

export async function pauseAudio() {
  try {
    const audio = await getAudio()
    await audio.pauseAsync()
  } catch {
    // 静默处理
  }
}

export async function seekAudio(percent: number) {
  try {
    const audio = await getAudio()
    const status = await audio.getStatusAsync()
    if (status.isLoaded && status.durationMillis) {
      await audio.setPositionAsync((percent / 100) * status.durationMillis)
    }
  } catch {
    // 静默处理
  }
}
