import { Router } from 'express'
import db from '../database/index.js'

const router = Router()

// GET /api/products?keyword=&categoryId=&sort=asc|desc&page=1&pageSize=12
router.get('/', (req, res, next) => {
  try {
    // --- validate & normalize query params ---
    const keyword = typeof req.query.keyword === 'string' && req.query.keyword.trim()
      ? req.query.keyword.trim()
      : ''

    let categoryId = null
    if (req.query.categoryId !== undefined && req.query.categoryId !== '') {
      const n = Number(req.query.categoryId)
      if (!Number.isInteger(n) || n <= 0) {
        return res.status(400).json({ success: false, message: 'categoryId 必须为正整数', code: 'VALIDATION_ERROR' })
      }
      categoryId = n
    }

    const sort = req.query.sort === 'desc' ? 'desc' : req.query.sort === 'asc' ? 'asc' : null

    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1)
    const pageSizeRaw = Number.parseInt(req.query.pageSize, 10) || 12
    const pageSize = Math.min(50, Math.max(1, pageSizeRaw))
    const offset = (page - 1) * pageSize

    // --- build parameterized query ---
    const where = ["p.status = 'on_sale'"]
    const params = {}
    if (keyword) {
      where.push('(p.name LIKE :kw OR p.description LIKE :kw)')
      params.kw = `%${keyword}%`
    }
    if (categoryId !== null) {
      where.push('p.category_id = :categoryId')
      params.categoryId = categoryId
    }
    const whereSql = where.join(' AND ')

    const orderSql = sort ? `p.price ${sort === 'desc' ? 'DESC' : 'ASC'}` : 'p.id ASC'

    const totalRow = db.prepare(`SELECT COUNT(*) AS n FROM products p WHERE ${whereSql}`).get(params)
    const items = db.prepare(
      `SELECT p.id, p.name, p.category_id, c.name AS category_name,
              p.price, p.stock, p.image_url, p.description, p.specifications
       FROM products p JOIN categories c ON c.id = p.category_id
       WHERE ${whereSql}
       ORDER BY ${orderSql}
       LIMIT :limit OFFSET :offset`
    ).all({ ...params, limit: pageSize, offset })

    res.json({
      success: true,
      data: { items, total: totalRow.n, page, pageSize },
      message: 'ok'
    })
  } catch (err) {
    next(err)
  }
})

// GET /api/products/:id
router.get('/:id', (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ success: false, message: '商品 ID 不合法', code: 'VALIDATION_ERROR' })
  }
  const row = db.prepare(
    `SELECT p.id, p.name, p.category_id, c.name AS category_name,
            p.price, p.stock, p.image_url, p.description, p.specifications, p.status
     FROM products p JOIN categories c ON c.id = p.category_id
     WHERE p.id = ?`
  ).get(id)
  if (!row) {
    return res.status(404).json({ success: false, message: '商品不存在', code: 'NOT_FOUND' })
  }
  res.json({ success: true, data: row, message: 'ok' })
})

export default router
