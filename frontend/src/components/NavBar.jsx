import { Link, useNavigate } from 'react-router-dom'
import { clearStoredAuth, getStoredAuth } from '../api'

export default function NavBar() {
  const navigate = useNavigate()
  const auth = getStoredAuth()

  return (
    <header className="nav">
      <div className="brand">CurbCall</div>
      <nav>
        <Link to="/driver/map">Driver</Link>
        <Link to="/admin">Admin</Link>
        {auth && (
          <button
            className="link-button"
            onClick={() => {
              clearStoredAuth()
              navigate('/')
            }}
          >
            Logout
          </button>
        )}
      </nav>
    </header>
  )
}
