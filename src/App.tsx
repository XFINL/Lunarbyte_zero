import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import HomePage from "@/pages/HomePage"
import SearchPage from "@/pages/SearchPage"
import ProfilePage from "@/pages/ProfilePage"
import BottomNav from "@/components/BottomNav"
import PlayerEngine from "@/components/PlayerEngine"

export default function App() {
  return (
    <Router>
      <div className="relative min-h-screen bg-white max-w-md mx-auto select-none">
        <PlayerEngine />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
        <BottomNav />
      </div>
    </Router>
  )
}