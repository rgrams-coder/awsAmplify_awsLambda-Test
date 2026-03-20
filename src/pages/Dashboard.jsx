import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

function useSessionCountdown() {
  const [remaining, setRemaining] = useState('')
  useEffect(() => {
    const tick = () => {
      const expiry = Number(localStorage.getItem('token_expiry'))
      const diff = expiry - Date.now()
      if (diff <= 0) { setRemaining('Expired'); return }
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setRemaining(`${h}h ${m}m ${s}s`)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])
  return remaining
}

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const remaining = useSessionCountdown()

  const handleLogout = async () => {
    await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, { method: 'POST' })
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <header className="max-w-4xl mx-auto flex items-center justify-between mb-8">
        <h1 className="text-xl font-bold text-gray-800">Lessee Dashboard</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
        >
          Logout
        </button>
      </header>

      {/* Welcome card */}
      <div className="max-w-4xl mx-auto grid gap-4">
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Welcome back</p>
          <h2 className="text-2xl font-semibold text-gray-800">{user?.name}</h2>
          <p className="text-gray-500 text-sm mt-1">{user?.email}</p>
        </div>

        {/* Session info */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-lg">⏱</div>
          <div>
            <p className="text-sm text-gray-500">Session expires in</p>
            <p className="text-lg font-semibold text-gray-800">{remaining}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
