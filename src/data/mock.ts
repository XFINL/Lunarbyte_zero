export interface Song {
  id: string
  title: string
  artist: string
  cover: string
  duration: number
  album: string
  url?: string
}

export const mockSongs: Song[] = [
  {
    id: "1",
    title: "起风了",
    artist: "买辣椒也用券",
    cover: "https://picsum.photos/seed/song1/400/400",
    duration: 320,
    album: "起风了",
  },
  {
    id: "2",
    title: "孤勇者",
    artist: "陈奕迅",
    cover: "https://picsum.photos/seed/song2/400/400",
    duration: 285,
    album: "孤勇者",
  },
  {
    id: "3",
    title: "漠河舞厅",
    artist: "柳爽",
    cover: "https://picsum.photos/seed/song3/400/400",
    duration: 300,
    album: "漠河舞厅",
  },
  {
    id: "4",
    title: "等你下课",
    artist: "周杰伦",
    cover: "https://picsum.photos/seed/song4/400/400",
    duration: 278,
    album: "等你下课",
  },
  {
    id: "5",
    title: "光年之外",
    artist: "邓紫棋",
    cover: "https://picsum.photos/seed/song5/400/400",
    duration: 270,
    album: "光年之外",
  },
  {
    id: "6",
    title: "倒数",
    artist: "邓紫棋",
    cover: "https://picsum.photos/seed/song6/400/400",
    duration: 245,
    album: "倒数",
  },
  {
    id: "7",
    title: "夜曲",
    artist: "周杰伦",
    cover: "https://picsum.photos/seed/song7/400/400",
    duration: 315,
    album: "十一月的萧邦",
  },
  {
    id: "8",
    title: "后来",
    artist: "刘若英",
    cover: "https://picsum.photos/seed/song8/400/400",
    duration: 290,
    album: "后来",
  },
]

export const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, "0")}`
}