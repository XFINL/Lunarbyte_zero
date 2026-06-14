const API_BASE = "https://meting.mikus.ink/api"

export interface ApiSong {
  id: string
  title: string
  author: string
  pic: string
  url: string
  lrc: string
}

export async function searchSongs(keyword: string): Promise<ApiSong[]> {
  try {
    const res = await fetch(
      `${API_BASE}?server=netease&type=search&id=${encodeURIComponent(keyword)}`,
    )
    if (!res.ok) return []
    const data: ApiSong[] = await res.json()
    return data
  } catch {
    return []
  }
}

export async function getSongInfo(id: string): Promise<ApiSong | null> {
  try {
    const res = await fetch(
      `${API_BASE}?server=netease&type=song&id=${id}`,
    )
    if (!res.ok) return null
    const data: ApiSong[] = await res.json()
    return data[0] ?? null
  } catch {
    return null
  }
}
