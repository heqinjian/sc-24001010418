import { Router } from 'express'
import db from '../database/index.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'

const router = Router()

const ALLOWED_STATUS = ['pending', 'paid', 'shipped', 'completed', 'cancelled']

// GET /api/admin/orders — all orders (admin)
router.get('/orders', requireAuth, requireAdmin, (req, res) => {
  const rows = db.prepare(
    `SELECT o.id, o.order_no, o.user_id, u.username, o.total_amount, o.status,
            o.recipient, o.phone, o.address, o.created_at,
            (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) AS item_count
     FROM orders o JOIN users u ON u.id = o.user_id
     ORDER BY o.id DESC`
  ).all()
  res.json({ success: true, data: { items: rows }, message: 'ok' })
})

// PATCH /api/admin/orders/:id/status — admin status change
router.patch('/orders/:id/status', requireAuth, requireAdmin, (req, res) => {
  const id = Number(req.params.id)
  const status = req.body?.status
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ success: false, message: '订单 ID 不合法', code: 'VALIDATION_ERROR' })
  }
  if (!ALLOWED_STATUS.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `状态必须是：${ALLOWED_STATUS.join(' / ')}`,
      code: 'VALIDATION_ERROR'
    })
  }
  const existing = db.prepare('SELECT id FROM orders WHERE id = ?').get(id)
  if (!existing) return res.status(404).json({ success: false, message: '订单不存在', code: 'NOT_FOUND' })

  db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, id)
  const order = db.prepare('SELECT id, order_no, status FROM orders WHERE id = ?').get(id)
  res.json({ success: true, data: order, message: '订单状态已更新' })
})

export default router
