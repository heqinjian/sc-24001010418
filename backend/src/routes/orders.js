import { Router } from 'express'
import crypto from 'node:crypto'
import db from '../database/index.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

function generateOrderNo() {
  const d = new Date()
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
  return `PH${ymd}${crypto.randomBytes(4).toString('hex').toUpperCase()}`
}

function round2(n) {
  return Math.round(n * 100) / 100
}

// POST /api/orders  body: { items: [{productId, quantity}], recipient, phone, address }
router.post('/', requireAuth, (req, res, next) => {
  const { items, recipient, phone, address } = req.body || {}

  // --- validate shipping info ---
  if (typeof recipient !== 'string' || recipient.trim().length < 2) {
    return res.status(400).json({ success: false, message: '请填写收货人姓名', code: 'VALIDATION_ERROR' })
  }
  if (typeof phone !== 'string' || !/^[0-9+\-\s]{7,20}$/.test(phone.trim())) {
    return res.status(400).json({ success: false, message: '请填写有效的联系电话', code: 'VALIDATION_ERROR' })
  }
  if (typeof address !== 'string' || address.trim().length < 5) {
    return res.status(400).json({ success: false, message: '请填写详细收货地址', code: 'VALIDATION_ERROR' })
  }

  // --- validate line items ---
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: '订单中没有商品', code: 'VALIDATION_ERROR' })
  }
  const lines = []
  for (const it of items) {
    const productId = Number(it?.productId)
    const quantity = Number(it?.quantity)
    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({ success: false, message: '商品 ID 不合法', code: 'VALIDATION_ERROR' })
    }
    if (!Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({ success: false, message: '购买数量必须为正整数', code: 'VALIDATION_ERROR' })
    }
    // merge duplicate productId
    const existing = lines.find((l) => l.productId === productId)
    if (existing) existing.quantity += quantity
    else lines.push({ productId, quantity })
  }

  const orderNo = generateOrderNo()

  // --- transactional creation ---
  try {
    db.exec('BEGIN IMMEDIATE')

    // Re-query price & stock from DB for every line (never trust client).
    const selectProduct = db.prepare(
      "SELECT id, name, price, stock, status FROM products WHERE id = ? AND status = 'on_sale'"
    )
    const resolved = []
    for (const line of lines) {
      const product = selectProduct.get(line.productId)
      if (!product) {
        db.exec('ROLLBACK')
        return res.status(404).json({ success: false, message: `商品 ${line.productId} 不存在或已下架`, code: 'NOT_FOUND' })
      }
      if (product.stock < line.quantity) {
        db.exec('ROLLBACK')
        return res.status(409).json({ success: false, message: `「${product.name}」库存不足（剩余 ${product.stock}）`, code: 'OUT_OF_STOCK' })
      }
      resolved.push({ ...line, product })
    }

    const totalAmount = round2(
      resolved.reduce((s, r) => s + r.product.price * r.quantity, 0)
    )

    const orderInfo = db.prepare(
      `INSERT INTO orders (order_no, user_id, total_amount, status, recipient, phone, address)
       VALUES (?, ?, ?, 'pending', ?, ?, ?)`
    ).run(orderNo, req.user.id, totalAmount, recipient.trim(), phone.trim(), address.trim())
    const orderId = Number(orderInfo.lastInsertRowid)

    const insertItem = db.prepare(
      `INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, subtotal)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    const decrementStock = db.prepare('UPDATE products SET stock = stock - ?, updated_at = datetime(\'now\') WHERE id = ?')

    for (const r of resolved) {
      const subtotal = round2(r.product.price * r.quantity)
      insertItem.run(orderId, r.productId, r.product.name, r.product.price, r.quantity, subtotal)
      decrementStock.run(r.quantity, r.productId)
    }

    db.exec('COMMIT')

    res.status(201).json({
      success: true,
      data: { orderId, orderNo, totalAmount },
      message: '下单成功'
    })
  } catch (err) {
    try { db.exec('ROLLBACK') } catch {}
    next(err)
  }
})

// GET /api/orders — current user's orders
router.get('/', requireAuth, (req, res) => {
  const rows = db.prepare(
    `SELECT id, order_no, total_amount, status, recipient, created_at
     FROM orders WHERE user_id = ? ORDER BY id DESC`
  ).all(req.user.id)
  res.json({ success: true, data: { items: rows }, message: 'ok' })
})

// GET /api/orders/:id — must belong to the current user
router.get('/:id', requireAuth, (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ success: false, message: '订单 ID 不合法', code: 'VALIDATION_ERROR' })
  }
  const order = db.prepare(
    'SELECT id, order_no, user_id, total_amount, status, recipient, phone, address, created_at FROM orders WHERE id = ?'
  ).get(id)
  if (!order || order.user_id !== req.user.id) {
    return res.status(404).json({ success: false, message: '订单不存在', code: 'NOT_FOUND' })
  }
  const items = db.prepare(
    'SELECT id, product_id, product_name, unit_price, quantity, subtotal FROM order_items WHERE order_id = ?'
  ).all(id)
  res.json({ success: true, data: { order, items }, message: 'ok' })
})

export default router
