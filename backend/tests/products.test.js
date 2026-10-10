// S3 API tests: categories + products list/detail with search/filter/sort/pagination.
// Uses a separate in-memory-ish DB? node:sqlite only supports file or :memory:.
// We use the real dev DB but seedIfEmpty is idempotent, so it's safe.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import app from '../src/app.js'

let server
let port

async function listen() {
  server = app.listen(0)
  await new Promise((r) => server.once('listening', r))
  port = server.address().port
}

test.before(listen)
test.after(() => server.close())

test('GET /api/categories returns 4 categories', async () => {
  const res = await fetch(`http://localhost:${port}/api/categories`)
  assert.equal(res.status, 200)
  const body = await res.json()
  assert.equal(body.success, true)
  assert.ok(body.data.items.length >= 4)
})

test('GET /api/products lists on-sale products with pagination', async () => {
  const res = await fetch(`http://localhost:${port}/api/products?page=1&pageSize=5`)
  const body = await res.json()
  assert.equal(res.status, 200)
  assert.equal(body.success, true)
  assert.equal(body.data.items.length, 5)
  assert.ok(body.data.total >= 10)
  // every item has price/stock/category_name
  for (const it of body.data.items) {
    assert.ok(typeof it.price === 'number')
    assert.ok(Number.isInteger(it.stock))
    assert.ok(it.category_name)
  }
})

test('GET /api/products keyword search filters results', async () => {
  const res = await fetch(`http://localhost:${port}/api/products?keyword=${encodeURIComponent('打印机')}`)
  const body = await res.json()
  assert.ok(body.data.items.length >= 1)
  for (const it of body.data.items) {
    assert.ok(it.name.includes('打印机') || it.description.includes('打印机'))
  }
})

test('GET /api/products categoryId filter + price sort asc', async () => {
  const res = await fetch(`http://localhost:${port}/api/products?categoryId=1&sort=asc`)
  const body = await res.json()
  const prices = body.data.items.map((p) => p.price)
  for (let i = 1; i < prices.length; i++) {
    assert.ok(prices[i] >= prices[i - 1])
  }
})

test('GET /api/products invalid categoryId returns 400', async () => {
  const res = await fetch(`http://localhost:${port}/api/products?categoryId=abc`)
  assert.equal(res.status, 400)
})

test('GET /api/products/:id returns product', async () => {
  const list = await fetch(`http://localhost:${port}/api/products?pageSize=1`).then((r) => r.json())
  const id = list.data.items[0].id
  const res = await fetch(`http://localhost:${port}/api/products/${id}`)
  const body = await res.json()
  assert.equal(res.status, 200)
  assert.equal(body.data.id, id)
})

test('GET /api/products/999999 returns 404', async () => {
  const res = await fetch(`http://localhost:${port}/api/products/999999`)
  assert.equal(res.status, 404)
})
