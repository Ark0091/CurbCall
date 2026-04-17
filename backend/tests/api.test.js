const test = require('node:test')
const assert = require('node:assert/strict')
const request = require('supertest')
const app = require('../src/app')

let authToken
let userId
let adminToken

test('registers a driver and returns a JWT token', async () => {
  const response = await request(app).post('/auth/register').send({
    name: 'Driver One',
    email: 'driver1@example.com',
    password: 'secret123',
    professionalType: 'delivery',
    licensePlate: 'AB-123-CD',
  })

  assert.equal(response.status, 201)
  assert.ok(response.body.token)
  assert.equal(response.body.user.professionalType, 'delivery')

  authToken = response.body.token
  userId = response.body.user.id
})

test('returns available zones', async () => {
  const response = await request(app).get('/zones')

  assert.equal(response.status, 200)
  assert.ok(Array.isArray(response.body))
  assert.ok(response.body.length >= 1)
})

test('starts and ends a session', async () => {
  const zonesResponse = await request(app).get('/zones')
  const zone = zonesResponse.body[0]

  const start = await request(app)
    .post('/sessions/start')
    .set('Authorization', `Bearer ${authToken}`)
    .send({ zoneId: zone.id, durationMinutes: 10 })

  assert.equal(start.status, 201)
  assert.equal(start.body.status, 'active')

  const end = await request(app)
    .post('/sessions/end')
    .set('Authorization', `Bearer ${authToken}`)
    .send({ sessionId: start.body.id })

  assert.equal(end.status, 200)
  assert.equal(end.body.status, 'completed')
})

test('returns session history for driver', async () => {
  const response = await request(app)
    .get(`/sessions/${userId}`)
    .set('Authorization', `Bearer ${authToken}`)

  assert.equal(response.status, 200)
  assert.ok(Array.isArray(response.body))
})

test('admin can list zones, create zone, and read analytics', async () => {
  const login = await request(app).post('/auth/login').send({
    email: 'admin@curbcall.paris',
    password: 'admin123',
  })
  assert.equal(login.status, 200)
  adminToken = login.body.token

  const zones = await request(app).get('/admin/zones').set('Authorization', `Bearer ${adminToken}`)
  assert.equal(zones.status, 200)
  assert.ok(Array.isArray(zones.body))

  const created = await request(app)
    .post('/admin/zones')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      name: 'Avenue des Champs-Élysées - C',
      district: '8th arrondissement',
      lat: 48.8698,
      lng: 2.3078,
    })
  assert.equal(created.status, 201)
  assert.equal(created.body.name, 'Avenue des Champs-Élysées - C')

  const analytics = await request(app)
    .get('/admin/analytics')
    .set('Authorization', `Bearer ${adminToken}`)
  assert.equal(analytics.status, 200)
  assert.equal(typeof analytics.body.complianceRate, 'number')
})
