import { useEffect, useState } from 'react'
import L from 'leaflet'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import { apiFetch } from '../api'

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

export default function AdminDashboardPage() {
  const [zones, setZones] = useState([])
  const [analytics, setAnalytics] = useState({
    activeSessions: 0,
    complianceRate: 100,
    mostCongestedZones: [],
  })

  useEffect(() => {
    Promise.all([apiFetch('/admin/zones'), apiFetch('/admin/analytics')])
      .then(([zoneData, analyticsData]) => {
        setZones(zoneData)
        setAnalytics(analyticsData)
      })
      .catch(() => {
        setZones([])
      })
  }, [])

  return (
    <main className="container">
      <h1>City Admin Dashboard</h1>
      <div className="kpis">
        <article className="card">
          <p className="muted">Active sessions</p>
          <strong>{analytics.activeSessions}</strong>
        </article>
        <article className="card">
          <p className="muted">Compliance rate</p>
          <strong>{analytics.complianceRate}%</strong>
        </article>
        <article className="card">
          <p className="muted">Tracked zones</p>
          <strong>{zones.length}</strong>
        </article>
      </div>

      <section className="card map-wrap">
        <MapContainer center={[48.8566, 2.3522]} zoom={12} scrollWheelZoom className="map">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {zones.map((zone) => (
            <Marker key={zone.id} position={[zone.lat, zone.lng]} icon={markerIcon}>
              <Popup>
                <strong>{zone.name}</strong>
                <br />
                {zone.district} — {zone.status}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </section>

      <section className="card">
        <h2>Most Congested Zones</h2>
        <ul>
          {(analytics.mostCongestedZones || []).map((zone) => (
            <li key={zone.zoneId}>
              {zone.zoneName}: {zone.sessions} sessions
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
