import { Router } from 'express'
import db from '../database/index.js'

const router = Router()

// GET /api/categories
router.get('/', (req, res) => {
  const rows = db.prepare(
    `SELECT c.id, c.name, c.description,
            (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id AND p.status = 'on_sale') AS product_count
     FROM categories c ORDER BY c.id ASC`
  ).all()
  res.json({ success: true, data: { items: rows }, message: 'ok' })
})

export default router
