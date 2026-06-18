const test = require('node:test')
const assert = require('node:assert/strict')
const { handler } = require('../functions/api')

test('netlify function serves express routes', async () => {
  const response = await handler(
    {
      httpMethod: 'GET',
      path: '/.netlify/functions/api/zones',
      headers: {},
      queryStringParameters: null,
      body: null,
      isBase64Encoded: false,
    },
    {},
  )

  assert.equal(response.statusCode, 200)
  const body = JSON.parse(response.body)
  assert.ok(Array.isArray(body))
})
