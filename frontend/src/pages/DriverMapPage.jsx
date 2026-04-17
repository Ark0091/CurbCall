import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import L from 'leaflet'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import { apiFetch } from '../api'

const durations = [5, 10, 15, 30]

const defaultCenter = [48.8566, 2.3522]

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

export default function DriverMapPage() {
  const navigate = useNavigate()
  const [zones, setZones] = useState([])
  const [durationMinutes, setDurationMinutes] = useState(15)
  const [error, setError] = useState('')

  useEffect(() => {
    apiFetch('/zones')
      .then(setZones)
      .catch(() => {
        setZones([
          {
            id: 'zone-demo',
            name: 'Demo Zone - Hôtel de Ville',
            district: '4th arrondissement',
            lat: 48.8566,
            lng: 2.3522,
            maxDurationMinutes: 15,
            status: 'available',
          },
        ])
      })
  }, [])

  const center = useMemo(() => {
    if (zones.length > 0) {
      return [zones[0].lat, zones[0].lng]
    }
    return defaultCenter
  }, [zones])

  const requestAccess = async (zoneId) => {
    setError('')
    try {
      const session = await apiFetch('/sessions/start', {
        method: 'POST',
        body: JSON.stringify({ zoneId, durationMinutes }),
      })
      localStorage.setItem('curbcall-active-session', JSON.stringify(session))
      navigate('/driver/session')
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  return (
    <main className="container">
      <h1>Nearby Curb Zones</h1>
      <p className="muted">Green curb slots are available for immediate access.</p>
      <div className="controls card">
        <label>
          Reservation length
          <select
            value={durationMinutes}
            onChange={(event) => setDurationMinutes(Number(event.target.value))}
          >
            {durations.map((duration) => (
              <option key={duration} value={duration}>
                {duration} min
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="map-wrap card">
        <MapContainer center={center} zoom={13} scrollWheelZoom className="map">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {zones.map((zone) => (
            <Marker key={zone.id} position={[zone.lat, zone.lng]} icon={markerIcon}>
              <Popup>
                <strong>{zone.name}</strong>
                <br />
                {zone.district}
                <br />
                Status: {zone.status}
                <br />
                <button onClick={() => requestAccess(zone.id)} className="primary">
                  Request Access
                </button>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {error && <p className="error">{error}</p>}
    </main>
  )
}
