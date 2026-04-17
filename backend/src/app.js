const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const {
  users,
  zones,
  sessions,
  getZonesWithLiveStatus,
  createUser,
  createZone,
  createSession,
} = require('./data/store')
const { JWT_SECRET, authenticate, authorizeAdmin } = require('./middleware/auth')

const app = express()
app.use(cors())
app.use(express.json())

const allowedDurations = new Set([5, 10, 15, 30])

const toPublicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  professionalType: user.professionalType,
  licensePlate: user.licensePlate,
  role: user.role,
})

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'curbcall-api' })
})

app.post('/auth/register', (req, res) => {
  const { name, email, password, professionalType, licensePlate } = req.body

  if (!name || !email || !password || !professionalType) {
    return res.status(400).json({
      error: 'name, email, password and professionalType are required',
    })
  }

  const normalizedEmail = email.toLowerCase()
  if (users.some((user) => user.email.toLowerCase() === normalizedEmail)) {
    return res.status(409).json({ error: 'Email already in use' })
  }

  const user = createUser({ name, email: normalizedEmail, password, professionalType, licensePlate })
  const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '12h' })

  return res.status(201).json({ token, user: toPublicUser(user) })
})

app.post('/auth/login', (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' })
  }

  const user = users.find((candidate) => candidate.email.toLowerCase() === email.toLowerCase())
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '12h' })
  return res.json({ token, user: toPublicUser(user) })
})

app.get('/zones', (_req, res) => {
  return res.json(getZonesWithLiveStatus().filter((zone) => zone.isActive))
})

app.post('/sessions/start', authenticate, (req, res) => {
  const { zoneId, durationMinutes } = req.body

  if (!zoneId || !allowedDurations.has(durationMinutes)) {
    return res.status(400).json({ error: 'zoneId and valid durationMinutes are required' })
  }

  const zone = zones.find((candidate) => candidate.id === zoneId && candidate.isActive)
  if (!zone) {
    return res.status(404).json({ error: 'Zone not found' })
  }

  const hasActive = sessions.some((session) => session.zoneId === zoneId && session.status === 'active')
  if (hasActive) {
    return res.status(409).json({ error: 'Zone is currently occupied' })
  }

  const activeUserSession = sessions.find(
    (session) => session.userId === req.user.userId && session.status === 'active',
  )

  if (activeUserSession) {
    return res.status(409).json({ error: 'User already has an active session' })
  }

  const session = createSession({ userId: req.user.userId, zoneId, durationMinutes })

  return res.status(201).json({
    ...session,
    zone,
    expiresAt: new Date(Date.parse(session.startedAt) + durationMinutes * 60 * 1000).toISOString(),
  })
})

app.post('/sessions/end', authenticate, (req, res) => {
  const { sessionId } = req.body

  const session = sessions.find((candidate) => {
    if (candidate.userId !== req.user.userId || candidate.status !== 'active') {
      return false
    }

    return sessionId ? candidate.id === sessionId : true
  })

  if (!session) {
    return res.status(404).json({ error: 'Active session not found' })
  }

  session.endedAt = new Date().toISOString()
  const durationMs = Date.parse(session.endedAt) - Date.parse(session.startedAt)
  session.durationMinutes = Math.max(1, Math.round(durationMs / 60000))
  session.status = 'completed'

  return res.json(session)
})

app.get('/sessions/:userId', authenticate, (req, res) => {
  if (req.user.role !== 'admin' && req.user.userId !== req.params.userId) {
    return res.status(403).json({ error: 'Access denied' })
  }

  const userSessions = sessions.filter((session) => session.userId === req.params.userId)
  return res.json(userSessions)
})

app.get('/admin/zones', authenticate, authorizeAdmin, (_req, res) => {
  return res.json(getZonesWithLiveStatus())
})

app.post('/admin/zones', authenticate, authorizeAdmin, (req, res) => {
  const { name, district, lat, lng, maxDurationMinutes, allowedTypes, activeHours, isActive } = req.body

  if (!name || !district || lat === undefined || lng === undefined) {
    return res.status(400).json({ error: 'name, district, lat and lng are required' })
  }

  const zone = createZone({
    name,
    district,
    lat: Number(lat),
    lng: Number(lng),
    maxDurationMinutes,
    allowedTypes,
    activeHours,
    isActive,
  })

  return res.status(201).json(zone)
})

app.get('/admin/analytics', authenticate, authorizeAdmin, (_req, res) => {
  const completed = sessions.filter((session) => session.status === 'completed').length
  const flagged = sessions.filter((session) => session.status === 'flagged').length
  const total = sessions.length

  const peakUsageMap = sessions.reduce((acc, session) => {
    const hour = new Date(session.startedAt).getHours()
    const key = `${String(hour).padStart(2, '0')}:00`
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})

  const congestionMap = sessions.reduce((acc, session) => {
    acc[session.zoneId] = (acc[session.zoneId] || 0) + 1
    return acc
  }, {})

  const mostCongestedZones = Object.entries(congestionMap)
    .map(([zoneId, count]) => ({
      zoneId,
      zoneName: zones.find((zone) => zone.id === zoneId)?.name || zoneId,
      sessions: count,
    }))
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, 5)

  return res.json({
    activeSessions: sessions.filter((session) => session.status === 'active').length,
    completedSessions: completed,
    complianceRate: total === 0 ? 100 : Number((((completed + flagged) / total) * 100).toFixed(2)),
    peakUsageTimes: peakUsageMap,
    mostCongestedZones,
  })
})

module.exports = app
