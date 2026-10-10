// S7 order workflow tests: create order, stock decrement, out-of-stock rejection,
// transactional integrity, and ownership isolation.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import app from '../src/app.js'

let server, port
test.before(async () => {
  server = app.listen(0)
  await new Promise((r) => server.once('listening', r))
  port = server.address().port
})
test.after(() => server.close())

async function register() {
  const username = 'o_' + crypto.randomBytes(4).toString('hex')
  const body = await fetch(`http://localhost:${port}/api/auth/register`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ username, password: 'secret123' })
  }).then((r) => r.json())
  return body.data.token
}

async function getProducts(token) {
  return fetch(`http://localhost:${port}/api/products?pageSize=20`, {
    headers: { authorization: `Bearer ${token}` }
  }).then((r) => r.json())
}

const shipping = { recipient: '何秦剑', phone: '13800138000', address: '陕西省汉中市东软信息学院 1 号楼 101 室' }

test('create order writes order, items and decrements stock', async () => {
  const token = await register()
  const catalog = await getProducts(token)
  const product = catalog.data.items.find((p) => p.stock >= 3)
  assert.ok(product, 'need a product with stock>=3')

  const beforeStock = product.stock
  const res = await fetch(`http://localhost:${port}/api/orders`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
    body: JSON.stringify({ items: [{ productId: product.id, quantity: 2 }], ...shipping })
  })
  assert.equal(res.status, 201)
  const body = await res.json()
  assert.match(body.data.orderNo, /^PH/)
  assert.equal(body.data.totalAmount, Math.round(product.price * 2 * 100) / 100)

  // stock reduced by 2
  const after = await fetch(`http://localhost:${port}/api/products/${product.id}`).then((r) => r.json())
  assert.equal(after.data.stock, beforeStock - 2)

  // order appears in my orders
  const list = await fetch(`http://localhost:${port}/api/orders`, {
    headers: { authorization: `Bearer ${token}` }
  }).then((r) => r.json())
  assert.ok(list.data.items.some((o) => o.order_no === body.data.orderNo))

  // detail contains items snapshot
  const detail = await fetch(`http://localhost:${port}/api/orders/${body.data.orderId}`, {
    headers: { authorization: `Bearer ${token}` }
  }).then((r) => r.json())
  assert.equal(detail.data.items.length, 1)
  assert.equal(detail.data.items[0].product_name, product.name)
})

test('order exceeding stock is rejected with 409 and stock unchanged', async () => {
  const token = await register()
  const catalog = await getProducts(token)
  const product = catalog.data.items.find((p) => p.stock >= 1)
  const beforeStock = product.stock

  const res = await fetch(`http://localhost:${port}/api/orders`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
    body: JSON.stringify({ items: [{ productId: product.id, quantity: product.stock + 1 }], ...shipping })
  })
  assert.equal(res.status, 409)

  const after = await fetch(`http://localhost:${port}/api/products/${product.id}`).then((r) => r.json())
  assert.equal(after.data.stock, beforeStock)
})

test('order without auth returns 401', async () => {
  const res = await fetch(`http://localhost:${port}/api/orders`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ items: [{ productId: 1, quantity: 1 }], ...shipping })
  })
  assert.equal(res.status, 401)
})

test('user cannot read another user order', async () => {
  const tokenA = await register()
  const catalog = await getProducts(tokenA)
  const product = catalog.data.items.find((p) => p.stock >= 1)
  const created = await fetch(`http://localhost:${port}/api/orders`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({ items: [{ productId: product.id, quantity: 1 }], ...shipping })
  }).then((r) => r.json())

  const tokenB = await register()
  const res = await fetch(`http://localhost:${port}/api/orders/${created.data.orderId}`, {
    headers: { authorization: `Bearer ${tokenB}` }
  })
  assert.equal(res.status, 404)
})

test('invalid shipping info returns 400', async () => {
  const token = await register()
  const res = await fetch(`http://localhost:${port}/api/orders`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
    body: JSON.stringify({ items: [{ productId: 1, quantity: 1 }], recipient: 'x', phone: '1', address: 'a' })
  })
  assert.equal(res.status, 400)
})
