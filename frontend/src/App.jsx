import { Navigate, Route, Routes } from 'react-router-dom'
import NavBar from './components/NavBar'
import DriverAuthPage from './pages/DriverAuthPage'
import DriverMapPage from './pages/DriverMapPage'
import ActiveSessionPage from './pages/ActiveSessionPage'
import SessionHistoryPage from './pages/SessionHistoryPage'
import AdminDashboardPage from './pages/AdminDashboardPage'

function App() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<DriverAuthPage />} />
        <Route path="/driver/map" element={<DriverMapPage />} />
        <Route path="/driver/session" element={<ActiveSessionPage />} />
        <Route path="/driver/history" element={<SessionHistoryPage />} />
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default App
