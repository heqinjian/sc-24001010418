import { Router } from 'express'
import db from '../database/index.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'

const router = Router()

// Validate a product payload shared by create/update. Returns an error message or null.
function validateProduct(body) {
  const { name, category_id, price, stock, image_url, description, specifications } = body || {}
  if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 80) {
    return '商品名称需为 2-80 个字符'
  }
  if (!Number.isInteger(Number(category_id)) || Number(category_id) <= 0) {
    return '请选择有效分类'
  }
  const priceN = Number(price)
  if (!Number.isFinite(priceN) || priceN < 0 || priceN > 1_000_000) {
    return '价格需为 0 到 1,000,000 之间的数字'
  }
  const stockN = Number(stock)
  if (!Number.isInteger(stockN) || stockN < 0 || stockN > 1_000_000) {
    return '库存需为 0 到 1,000,000 之间的整数'
  }
  if (image_url !== undefined && typeof image_url !== 'string') return '图片地址格式不正确'
  if (description !== undefined && typeof description !== 'string') return '描述格式不正确'
  if (specifications !== undefined && typeof specifications !== 'string') return '规格格式不正确'
  return null
}

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

// POST /api/products — admin create
router.post('/', requireAuth, requireAdmin, (req, res) => {
  const error = validateProduct(req.body)
  if (error) return res.status(400).json({ success: false, message: error, code: 'VALIDATION_ERROR' })

  const category = db.prepare('SELECT id FROM categories WHERE id = ?').get(Number(req.body.category_id))
  if (!category) return res.status(400).json({ success: false, message: '分类不存在', code: 'VALIDATION_ERROR' })

  const info = db.prepare(
    `INSERT INTO products (name, category_id, price, stock, image_url, description, specifications, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'on_sale')`
  ).run(
    req.body.name.trim(),
    Number(req.body.category_id),
    Number(req.body.price),
    Number(req.body.stock),
    req.body.image_url || '',
    req.body.description || '',
    req.body.specifications || ''
  )
  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(Number(info.lastInsertRowid))
  res.status(201).json({ success: true, data: row, message: '商品已创建' })
})

// PUT /api/products/:id — admin update
router.put('/:id', requireAuth, requireAdmin, (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ success: false, message: '商品 ID 不合法', code: 'VALIDATION_ERROR' })
  }
  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(id)
  if (!existing) return res.status(404).json({ success: false, message: '商品不存在', code: 'NOT_FOUND' })

  const merged = {
    name: req.body.name ?? existing.name,
    category_id: req.body.category_id ?? existing.category_id,
    price: req.body.price ?? existing.price,
    stock: req.body.stock ?? existing.stock,
    image_url: req.body.image_url ?? existing.image_url,
    description: req.body.description ?? existing.description,
    specifications: req.body.specifications ?? existing.specifications
  }
  const error = validateProduct(merged)
  if (error) return res.status(400).json({ success: false, message: error, code: 'VALIDATION_ERROR' })

  db.prepare(
    `UPDATE products SET name=?, category_id=?, price=?, stock=?, image_url=?, description=?,
       specifications=?, updated_at=datetime('now') WHERE id=?`
  ).run(
    String(merged.name).trim(),
    Number(merged.category_id),
    Number(merged.price),
    Number(merged.stock),
    merged.image_url,
    merged.description,
    merged.specifications,
    id
  )
  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(id)
  res.json({ success: true, data: row, message: '商品已更新' })
})

// DELETE /api/products/:id — admin off-shelf (soft delete preserves order history)
router.delete('/:id', requireAuth, requireAdmin, (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ success: false, message: '商品 ID 不合法', code: 'VALIDATION_ERROR' })
  }
  const existing = db.prepare('SELECT id FROM products WHERE id = ?').get(id)
  if (!existing) return res.status(404).json({ success: false, message: '商品不存在', code: 'NOT_FOUND' })

  db.prepare("UPDATE products SET status='off_shelf', updated_at=datetime('now') WHERE id=?").run(id)
  res.json({ success: true, data: { id }, message: '商品已下架' })
})

export default router
