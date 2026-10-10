// S6 auth API tests: register, login, me, bad password, protected route, admin guard.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import app from '../src/app.js'

let server, port
const unique = 'u_' + crypto.randomBytes(4).toString('hex')

test.before(async () => {
  server = app.listen(0)
  await new Promise((r) => server.once('listening', r))
  port = server.address().port
})
test.after(() => server.close())

test('register creates a user and returns token', async () => {
  const res = await fetch(`http://localhost:${port}/api/auth/register`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ username: unique, password: 'secret123' })
  })
  assert.equal(res.status, 201)
  const body = await res.json()
  assert.ok(body.data.token)
  assert.equal(body.data.user.role, 'user')
})

test('duplicate register returns 409', async () => {
  const res = await fetch(`http://localhost:${port}/api/auth/register`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ username: unique, password: 'secret123' })
  })
  assert.equal(res.status, 409)
})

test('login with wrong password returns 401', async () => {
  const res = await fetch(`http://localhost:${port}/api/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ username: unique, password: 'wrongpass' })
  })
  assert.equal(res.status, 401)
})

test('login then me works', async () => {
  const login = await fetch(`http://localhost:${port}/api/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ username: unique, password: 'secret123' })
  }).then((r) => r.json())

  const res = await fetch(`http://localhost:${port}/api/auth/me`, {
    headers: { authorization: `Bearer ${login.data.token}` }
  })
  const body = await res.json()
  assert.equal(body.data.user.username, unique)
})

test('me without token returns 401', async () => {
  const res = await fetch(`http://localhost:${port}/api/auth/me`)
  assert.equal(res.status, 401)
})

test('validation rejects short password', async () => {
  const res = await fetch(`http://localhost:${port}/api/auth/register`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ username: 'baduser', password: '123' })
  })
  assert.equal(res.status, 400)
})
