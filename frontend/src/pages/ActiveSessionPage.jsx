import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../api'

const asClock = (seconds) => {
  const mins = String(Math.floor(seconds / 60)).padStart(2, '0')
  const secs = String(seconds % 60).padStart(2, '0')
  return `${mins}:${secs}`
}

export default function ActiveSessionPage() {
  const navigate = useNavigate()
  const [session, setSession] = useState(() => {
    const raw = localStorage.getItem('curbcall-active-session')
    return raw ? JSON.parse(raw) : null
  })

  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const remaining = useMemo(() => {
    if (!session?.expiresAt) return 0
    const ms = Date.parse(session.expiresAt) - now
    return Math.max(0, Math.floor(ms / 1000))
  }, [session, now])

  const endSession = async () => {
    if (!session) return
    await apiFetch('/sessions/end', {
      method: 'POST',
      body: JSON.stringify({ sessionId: session.id }),
    }).catch(() => null)

    localStorage.removeItem('curbcall-active-session')
    setSession(null)
    navigate('/driver/history')
  }

  if (!session) {
    return (
      <main className="container narrow">
        <h1>No active session</h1>
        <button className="primary" onClick={() => navigate('/driver/map')}>
          Back to map
        </button>
      </main>
    )
  }

  return (
    <main className="container narrow">
      <h1>Active Session</h1>
      <div className="card center">
        <p className="muted">Zone</p>
        <h2>{session.zone?.name || session.zoneId}</h2>
        <p className="timer">{asClock(remaining)}</p>
        <button className="primary" onClick={endSession}>End Session</button>
      </div>
    </main>
  )
}
