const { randomUUID } = require('crypto')

const now = new Date().toISOString()

const users = [
  {
    id: 'admin-1',
    name: 'Paris Admin',
    email: 'admin@curbcall.paris',
    password: 'admin123',
    professionalType: 'city_admin',
    licensePlate: null,
    role: 'admin',
    createdAt: now,
  },
]

const zones = [
  {
    id: 'zone-1',
    name: 'Rue de Rivoli - Loading Bay A',
    district: '1st arrondissement',
    lat: 48.8567,
    lng: 2.3522,
    maxDurationMinutes: 30,
    allowedTypes: ['delivery', 'taxi', 'medical', 'trades'],
    activeHours: { 'mon-fri': '07:00-20:00', sat: '08:00-14:00' },
    isActive: true,
    status: 'available',
  },
  {
    id: 'zone-2',
    name: 'Boulevard Saint-Germain - Zone B',
    district: '6th arrondissement',
    lat: 48.853,
    lng: 2.333,
    maxDurationMinutes: 15,
    allowedTypes: ['delivery', 'trades'],
    activeHours: { 'mon-sat': '07:00-19:00' },
    isActive: true,
    status: 'available',
  },
]

const sessions = []

const statusForZone = (zoneId) => {
  const active = sessions.find((session) => session.zoneId === zoneId && session.status === 'active')
  if (active) return 'occupied'
  return 'available'
}

const getZonesWithLiveStatus = () =>
  zones.map((zone) => ({
    ...zone,
    status: statusForZone(zone.id),
  }))

const createUser = ({ name, email, password, professionalType, licensePlate, role = 'driver' }) => {
  const user = {
    id: randomUUID(),
    name,
    email,
    password,
    professionalType,
    licensePlate: licensePlate || null,
    role,
    createdAt: new Date().toISOString(),
  }

  users.push(user)
  return user
}

const createZone = ({
  name,
  district,
  lat,
  lng,
  maxDurationMinutes = 15,
  allowedTypes = ['delivery', 'taxi', 'medical', 'trades'],
  activeHours = {},
  isActive = true,
}) => {
  const zone = {
    id: randomUUID(),
    name,
    district,
    lat,
    lng,
    maxDurationMinutes,
    allowedTypes,
    activeHours,
    isActive,
    status: 'available',
  }

  zones.push(zone)
  return zone
}

const createSession = ({ userId, zoneId, durationMinutes }) => {
  const session = {
    id: randomUUID(),
    userId,
    zoneId,
    startedAt: new Date().toISOString(),
    endedAt: null,
    durationMinutes,
    status: 'active',
  }

  sessions.push(session)
  return session
}

module.exports = {
  users,
  zones,
  sessions,
  getZonesWithLiveStatus,
  createUser,
  createZone,
  createSession,
}
