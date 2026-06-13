import { usePlayerStore } from "@/store/playerStore"

let audioEl: HTMLAudioElement | null = null
let isInitialized = false

function getAudio(): HTMLAudioElement {
  if (!audioEl) {
    audioEl = new Audio()
    audioEl.preload = "auto"
  }
  return audioEl
}

function onTimeUpdate() {
  const audio = getAudio()
  if (audio.duration && isFinite(audio.duration)) {
    const progress = (audio.currentTime / audio.duration) * 100
    usePlayerStore.getState().setProgress(progress)
  }
}

function onEnded() {
  usePlayerStore.getState().next()
}

function onError() {
  usePlayerStore.getState().pause()
}

/** 初始化音频事件（只需一次） */
export function initAudioEngine() {
  if (isInitialized) return
  isInitialized = true

  const audio = getAudio()
  audio.addEventListener("timeupdate", onTimeUpdate)
  audio.addEventListener("ended", onEnded)
  audio.addEventListener("error", onError)
}

/** 播放指定 URL 的歌曲 */
export function playAudio(url: string) {
  const audio = getAudio()
  audio.src = url
  audio.play().catch(() => {
    // 播放失败（如跨域、格式不支持）
    usePlayerStore.getState().pause()
  })
}

/** 恢复播放 */
export function resumeAudio() {
  const audio = getAudio()
  audio.play().catch(() => {})
}

/** 暂停播放 */
export function pauseAudio() {
  getAudio().pause()
}

/** 设置播放进度 */
export function seekAudio(percent: number) {
  const audio = getAudio()
  if (audio.duration && isFinite(audio.duration)) {
    audio.currentTime = (percent / 100) * audio.duration
  }
}

/** 获取音频当前时长（秒），用于未提供 duration 的歌曲 */
export function getAudioDuration(): number {
  const audio = getAudio()
  return audio.duration && isFinite(audio.duration) ? audio.duration : 0
}