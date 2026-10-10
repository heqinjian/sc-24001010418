// Safe local admin bootstrap. Reads ADMIN_USERNAME / ADMIN_PASSWORD from the
// environment (or backend/.env). No real password is hardcoded in source.
//
// Usage (from backend/):
//   $env:ADMIN_USERNAME="admin"; $env:ADMIN_PASSWORD="choose-a-strong-one"; node scripts/setup-admin.js
import '../src/config/index.js'
import db from '../src/database/index.js'
import { hashPassword } from '../src/utils/password.js'

const username = process.env.ADMIN_USERNAME
const password = process.env.ADMIN_PASSWORD

if (!username || !password) {
  console.error('Set ADMIN_USERNAME and ADMIN_PASSWORD in the environment first.')
  process.exit(1)
}
if (password.length < 8) {
  console.error('ADMIN_PASSWORD must be at least 8 characters.')
  process.exit(1)
}

const existing = db.prepare('SELECT * FROM users WHERE username = ?').get(username)
if (existing) {
  if (existing.role === 'admin') {
    console.log(`Admin "${username}" already exists; nothing to do.`)
    process.exit(0)
  }
  db.prepare("UPDATE users SET role = 'admin' WHERE id = ?").run(existing.id)
  console.log(`User "${username}" promoted to admin.`)
  process.exit(0)
}

db.prepare('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)').run(
  username,
  hashPassword(password),
  'admin'
)
console.log(`Admin "${username}" created.`)
