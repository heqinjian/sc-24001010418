// Password hashing using Node's built-in scrypt (no native bcrypt dependency).
import crypto from 'node:crypto'

const KEYLEN = 64

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex')
  const derived = crypto.scryptSync(password, salt, KEYLEN).toString('hex')
  return `scrypt$${salt}$${derived}`
}

export function verifyPassword(password, stored) {
  const [scheme, salt, hash] = String(stored).split('$')
  if (scheme !== 'scrypt' || !salt || !hash) return false
  const derived = crypto.scryptSync(password, salt, KEYLEN)
  const expected = Buffer.from(hash, 'hex')
  return expected.length === derived.length && crypto.timingSafeEqual(expected, derived)
}
