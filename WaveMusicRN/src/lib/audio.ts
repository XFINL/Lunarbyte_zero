import { Audio, type AVPlaybackSource } from "expo-av"
import { usePlayerStore } from "@/store/playerStore"

let sound: Audio.Sound | null = null
let isInitialized = false

async function getSound(): Promise<Audio.Sound> {
  if (!sound) {
    sound = new Audio.Sound()
  }
  return sound
}

function onPlaybackStatusUpdate(status: any) {
  if (!status.isLoaded) return

  if (status.didJustFinish) {
    usePlayerStore.getState().next()
    return
  }

  if (status.durationMillis && status.durationMillis > 0) {
    const progress = (status.positionMillis / status.durationMillis) * 100
    usePlayerStore.getState().setProgress(progress)
  }
}

export async function initAudioEngine() {
  if (isInitialized) return
  isInitialized = true
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
    playsInSilentModeIOS: true,
    staysActiveInBackground: true,
    shouldDuckAndroid: true,
  })
}

export async function playAudio(url: string) {
  try {
    const s = await getSound()
    // Unload previous and load new
    await s.unloadAsync()
    await s.loadAsync({ uri: url } as AVPlaybackSource)
    s.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate)
    await s.playAsync()
  } catch {
    // silent
  }
}

export async function resumeAudio() {
  try {
    const s = await getSound()
    await s.playAsync()
  } catch {
    // silent
  }
}

export async function pauseAudio() {
  try {
    const s = await getSound()
    await s.pauseAsync()
  } catch {
    // silent
  }
}

export async function seekAudio(percent: number) {
  try {
    const s = await getSound()
    const status = await s.getStatusAsync()
    if (status.isLoaded && status.durationMillis) {
      const millis = (percent / 100) * status.durationMillis
      await s.setPositionAsync(millis)
    }
  } catch {
    // silent
  }
}

export async function stopAudio() {
  try {
    const s = await getSound()
    await s.stopAsync()
    await s.unloadAsync()
  } catch {
    // silent
  }
}