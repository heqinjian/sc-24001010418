// S8 admin tests: product CRUD + order status, and normal-user rejection.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import app from '../src/app.js'
import db from '../src/database/index.js'
import { hashPassword } from '../src/utils/password.js'

let server, port, adminToken, userToken
const adminName = 'adm_' + crypto.randomBytes(4).toString('hex')
const userName = 'usr_' + crypto.randomBytes(4).toString('hex')

test.before(async () => {
  server = app.listen(0)
  await new Promise((r) => server.once('listening', r))
  port = server.address().port

  // create admin directly
  db.prepare('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)').run(
    adminName, hashPassword('adminpass123'), 'admin'
  )
  // create normal user via API
  await fetch(`http://localhost:${port}/api/auth/register`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ username: userName, password: 'userpass123' })
  })

  adminToken = (await fetch(`http://localhost:${port}/api/auth/login`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ username: adminName, password: 'adminpass123' })
  }).then((r) => r.json())).data.token

  userToken = (await fetch(`http://localhost:${port}/api/auth/login`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ username: userName, password: 'userpass123' })
  }).then((r) => r.json())).data.token
})
test.after(() => server.close())

test('admin can create a product', async () => {
  const res = await fetch(`http://localhost:${port}/api/products`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      name: '测试商品 ' + crypto.randomBytes(2).toString('hex'),
      category_id: 1, price: 199.5, stock: 10, description: '测试', specifications: '测试规格'
    })
  })
  assert.equal(res.status, 201)
  const body = await res.json()
  assert.equal(body.data.stock, 10)
})

test('create with invalid price returns 400', async () => {
  const res = await fetch(`http://localhost:${port}/api/products`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ name: '坏商品', category_id: 1, price: -5, stock: 1 })
  })
  assert.equal(res.status, 400)
})

test('normal user cannot create product (403)', async () => {
  const res = await fetch(`http://localhost:${port}/api/products`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${userToken}` },
    body: JSON.stringify({ name: '越权商品', category_id: 1, price: 10, stock: 1 })
  })
  assert.equal(res.status, 403)
})

test('admin can update and off-shelf a product', async () => {
  const created = await fetch(`http://localhost:${port}/api/products`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ name: '待编辑商品', category_id: 2, price: 50, stock: 5 })
  }).then((r) => r.json())
  const id = created.data.id

  const upd = await fetch(`http://localhost:${port}/api/products/${id}`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ price: 55, stock: 8 })
  }).then((r) => r.json())
  assert.equal(upd.data.price, 55)
  assert.equal(upd.data.stock, 8)

  const del = await fetch(`http://localhost:${port}/api/products/${id}`, {
    method: 'DELETE', headers: { authorization: `Bearer ${adminToken}` }
  })
  assert.equal(del.status, 200)
})

test('admin can list all orders and change status', async () => {
  const list = await fetch(`http://localhost:${port}/api/admin/orders`, {
    headers: { authorization: `Bearer ${adminToken}` }
  }).then((r) => r.json())
  assert.ok(Array.isArray(list.data.items))

  // find or skip if no orders exist yet
  if (list.data.items.length > 0) {
    const id = list.data.items[0].id
    const res = await fetch(`http://localhost:${port}/api/admin/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ status: 'paid' })
    })
    assert.equal(res.status, 200)
  }
})

test('normal user cannot list all orders (403)', async () => {
  const res = await fetch(`http://localhost:${port}/api/admin/orders`, {
    headers: { authorization: `Bearer ${userToken}` }
  })
  assert.equal(res.status, 403)
})

test('invalid status value returns 400', async () => {
  const res = await fetch(`http://localhost:${port}/api/admin/orders/1/status`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ status: 'bogus' })
  })
  assert.equal(res.status, 400)
})
