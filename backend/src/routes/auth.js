import { Router } from 'express'
import db from '../database/index.js'
import { hashPassword, verifyPassword } from '../utils/password.js'
import { signToken } from '../utils/jwt.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

function publicUser(row) {
  return { id: row.id, username: row.username, role: row.role, created_at: row.created_at }
}

// POST /api/auth/register
router.post('/register', (req, res) => {
  const { username, password } = req.body || {}
  if (typeof username !== 'string' || !/^[A-Za-z0-9_]{3,20}$/.test(username)) {
    return res.status(400).json({ success: false, message: '用户名需为 3-20 位字母、数字或下划线', code: 'VALIDATION_ERROR' })
  }
  if (typeof password !== 'string' || password.length < 6 || password.length > 64) {
    return res.status(400).json({ success: false, message: '密码长度需为 6-64 位', code: 'VALIDATION_ERROR' })
  }

  const exists = db.prepare('SELECT id FROM users WHERE username = ?').get(username)
  if (exists) {
    return res.status(409).json({ success: false, message: '用户名已被注册', code: 'CONFLICT' })
  }

  const info = db.prepare(
    'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)'
  ).run(username, hashPassword(password), 'user')

  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(Number(info.lastInsertRowid))
  const token = signToken({ sub: row.id, username: row.username, role: row.role })
  res.status(201).json({ success: true, data: { token, user: publicUser(row) }, message: '注册成功' })
})

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { username, password } = req.body || {}
  if (typeof username !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ success: false, message: '请输入用户名和密码', code: 'VALIDATION_ERROR' })
  }
  const row = db.prepare('SELECT * FROM users WHERE username = ?').get(username)
  if (!row || !verifyPassword(password, row.password_hash)) {
    return res.status(401).json({ success: false, message: '用户名或密码错误', code: 'UNAUTHORIZED' })
  }
  const token = signToken({ sub: row.id, username: row.username, role: row.role })
  res.json({ success: true, data: { token, user: publicUser(row) }, message: '登录成功' })
})

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
  const row = db.prepare('SELECT id, username, role, created_at FROM users WHERE id = ?').get(req.user.id)
  if (!row) return res.status(401).json({ success: false, message: '用户不存在', code: 'UNAUTHORIZED' })
  res.json({ success: true, data: { user: publicUser(row) }, message: 'ok' })
})

export default router
