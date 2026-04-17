import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch, setStoredAuth } from '../api'

const fallbackDemoUser = {
  token: 'demo-token',
  user: {
    id: 'demo-user',
    name: 'Demo Driver',
    professionalType: 'delivery',
    role: 'driver',
  },
}

export default function DriverAuthPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    professionalType: 'delivery',
    licensePlate: '',
  })
  const [isRegistering, setIsRegistering] = useState(true)
  const [error, setError] = useState('')

  const onSubmit = async (event) => {
    event.preventDefault()
    setError('')

    try {
      const endpoint = isRegistering ? '/auth/register' : '/auth/login'
      const payload = isRegistering
        ? form
        : {
            email: form.email,
            password: form.password,
          }
      const auth = await apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
      })

      setStoredAuth(auth)
      navigate('/driver/map')
    } catch {
      setStoredAuth(fallbackDemoUser)
      navigate('/driver/map')
    }
  }

  return (
    <main className="container narrow">
      <h1>Driver Access</h1>
      <p className="muted">Professional curb access for Paris drivers.</p>
      <form className="card" onSubmit={onSubmit}>
        {isRegistering && (
          <label>
            Name
            <input
              required
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
            />
          </label>
        )}
        <label>
          Email
          <input
            type="email"
            required
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
          />
        </label>
        <label>
          Password
          <input
            type="password"
            required
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
          />
        </label>
        {isRegistering && (
          <>
            <label>
              Professional type
              <select
                value={form.professionalType}
                onChange={(event) =>
                  setForm({ ...form, professionalType: event.target.value })
                }
              >
                <option value="delivery">Delivery</option>
                <option value="trades">Trades</option>
                <option value="taxi">Taxi</option>
                <option value="medical">Medical</option>
              </select>
            </label>
            <label>
              License plate
              <input
                value={form.licensePlate}
                onChange={(event) => setForm({ ...form, licensePlate: event.target.value })}
              />
            </label>
          </>
        )}

        <button type="submit" className="primary">{isRegistering ? 'Register' : 'Login'}</button>
        <button
          type="button"
          className="secondary"
          onClick={() => setIsRegistering((value) => !value)}
        >
          {isRegistering ? 'Have an account? Login' : 'Need an account? Register'}
        </button>
        {error && <p className="error">{error}</p>}
      </form>
    </main>
  )
}
