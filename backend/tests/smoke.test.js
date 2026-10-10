// Backend smoke test: boot the app on an ephemeral port and hit /api/health.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import app from '../src/app.js'

test('GET /api/health returns ok', async () => {
  const server = app.listen(0)
  await new Promise((r) => server.once('listening', r))
  const port = server.address().port

  const res = await fetch(`http://localhost:${port}/api/health`)
  assert.equal(res.status, 200)
  const body = await res.json()
  assert.equal(body.success, true)
  assert.equal(body.data.status, 'ok')

  server.close()
})

test('unknown route returns 404 envelope', async () => {
  const server = app.listen(0)
  await new Promise((r) => server.once('listening', r))
  const port = server.address().port

  const res = await fetch(`http://localhost:${port}/api/does-not-exist`)
  assert.equal(res.status, 404)
  const body = await res.json()
  assert.equal(body.success, false)

  server.close()
})
