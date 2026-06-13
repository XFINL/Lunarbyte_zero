import { useUserStore } from "@/store/userStore"
import { usePlayerStore } from "@/store/playerStore"
import {
  IconUser,
  IconHeart,
  IconClock,
  IconList,
  IconPlay,
} from "@/components/Icons"

export default function ProfilePage() {
  const { favorites, recentPlays, playlists } = useUserStore()
  const { play, currentSong, isPlaying, togglePlay } = usePlayerStore()

  const handlePlaySong = (song: typeof favorites[0]) => {
    if (currentSong?.id === song.id) {
      togglePlay()
    } else {
      play(song)
    }
  }

  return (
    <div className="min-h-screen px-5 pt-14 pb-28 animate-fade-in">
      {/* 用户信息 */}
      <div className="flex flex-col items-center py-6">
        <div className="w-20 h-20 rounded-full glass-strong flex items-center justify-center mb-4">
          <IconUser size={36} className="text-black/50" />
        </div>
        <h1 className="text-xl font-semibold text-black">音乐爱好者</h1>
        <p className="text-sm text-black/40 mt-1">
          {favorites.length} 首收藏 · {playlists.length} 个歌单
        </p>
      </div>

      {/* 快捷入口 */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="glass rounded-2xl p-4 flex flex-col items-center gap-2">
          <IconHeart size={22} className="text-black/60" />
          <span className="text-xs text-black/40">收藏</span>
          <span className="text-lg font-semibold text-black">{favorites.length}</span>
        </div>
        <div className="glass rounded-2xl p-4 flex flex-col items-center gap-2">
          <IconClock size={22} className="text-black/60" />
          <span className="text-xs text-black/40">最近</span>
          <span className="text-lg font-semibold text-black">{recentPlays.length}</span>
        </div>
        <div className="glass rounded-2xl p-4 flex flex-col items-center gap-2">
          <IconList size={22} className="text-black/60" />
          <span className="text-xs text-black/40">歌单</span>
          <span className="text-lg font-semibold text-black">{playlists.length}</span>
        </div>
      </div>

      {/* 我的歌单 */}
      <section className="mb-6">
        <h2 className="text-base font-medium text-black mb-3">我的歌单</h2>
        <div className="space-y-2">
          {playlists.map((pl) => (
            <div key={pl.id} className="glass rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-black">{pl.name}</h3>
                <span className="text-xs text-black/20">{pl.songs.length} 首</span>
              </div>
              <div className="flex gap-2">
                {pl.songs.map((song) => (
                  <div
                    key={song.id}
                    className="w-10 h-10 rounded-lg overflow-hidden bg-black/5"
                  >
                    <img
                      src={song.cover}
                      alt={song.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 最近播放 */}
      <section>
        <h2 className="text-base font-medium text-black mb-3">最近播放</h2>
        <div className="space-y-1">
          {recentPlays.map((song) => {
            const isActive = currentSong?.id === song.id
            return (
              <div
                key={song.id}
                onClick={() => handlePlaySong(song)}
                className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all duration-200 ${
                  isActive ? "glass-strong" : "hover:bg-black/3"
                }`}
              >
                <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 bg-black/5">
                  <img
                    src={song.cover}
                    alt={song.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium truncate ${
                      isActive ? "text-black" : "text-black/70"
                    }`}
                  >
                    {song.title}
                  </p>
                  <p className="text-xs text-black/35 truncate mt-0.5">
                    {song.artist}
                  </p>
                </div>
                {isActive && (
                  <IconPlay size={16} className="text-black/50 shrink-0" />
                )}
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}