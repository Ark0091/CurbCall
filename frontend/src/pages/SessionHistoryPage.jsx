import { useEffect, useMemo, useState } from 'react'
import { apiFetch, getStoredAuth } from '../api'

export default function SessionHistoryPage() {
  const [sessions, setSessions] = useState([])

  useEffect(() => {
    const auth = getStoredAuth()
    if (!auth?.user?.id) {
      return
    }

    apiFetch(`/sessions/${auth.user.id}`)
      .then(setSessions)
      .catch(() => setSessions([]))
  }, [])

  const savings = useMemo(
    () => sessions.filter((session) => session.status === 'completed').length * 35,
    [sessions],
  )

  return (
    <main className="container">
      <h1>Session History</h1>
      <div className="kpis">
        <article className="card">
          <p className="muted">Sessions</p>
          <strong>{sessions.length}</strong>
        </article>
        <article className="card">
          <p className="muted">Fines Avoided</p>
          <strong>{sessions.filter((session) => session.status === 'completed').length}</strong>
        </article>
        <article className="card">
          <p className="muted">Estimated Savings</p>
          <strong>{savings}€</strong>
        </article>
      </div>
      <section className="card">
        {sessions.length === 0 ? (
          <p className="muted">No sessions recorded yet.</p>
        ) : (
          <ul>
            {sessions.map((session) => (
              <li key={session.id}>
                {session.zoneId} — {session.status} — {session.durationMinutes} minutes
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
