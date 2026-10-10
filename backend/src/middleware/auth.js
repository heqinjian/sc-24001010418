import { verifyToken } from '../utils/jwt.js'

// Require a valid Bearer token; attaches req.user = { id, username, role }.
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const [scheme, token] = header.split(' ')
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ success: false, message: '请先登录', code: 'UNAUTHORIZED' })
  }
  try {
    const payload = verifyToken(token)
    req.user = { id: payload.sub, username: payload.username, role: payload.role }
    next()
  } catch {
    return res.status(401).json({ success: false, message: '登录已失效，请重新登录', code: 'UNAUTHORIZED' })
  }
}

// Require admin role (must run after requireAuth).
export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: '权限不足', code: 'FORBIDDEN' })
  }
  next()
}
