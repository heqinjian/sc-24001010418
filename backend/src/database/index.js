// SQLite connection + schema bootstrap. Uses Node 22's built-in node:sqlite.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { DatabaseSync } from 'node:sqlite'
import config from '../config/index.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
// Resolve database path relative to backend/ working dir.
const dbPath = path.isAbsolute(config.databasePath)
  ? config.databasePath
  : path.resolve(process.cwd(), config.databasePath)

fs.mkdirSync(path.dirname(dbPath), { recursive: true })

const db = new DatabaseSync(dbPath)
db.exec('PRAGMA foreign_keys = ON')
db.exec('PRAGMA journal_mode = WAL')

// Create all tables if they do not exist. Idempotent.
function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      username      TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role          TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user','admin')),
      created_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS categories (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS products (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      name          TEXT NOT NULL,
      category_id   INTEGER NOT NULL REFERENCES categories(id),
      price         REAL NOT NULL CHECK (price >= 0),
      stock         INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
      image_url     TEXT NOT NULL DEFAULT '',
      description   TEXT NOT NULL DEFAULT '',
      specifications TEXT NOT NULL DEFAULT '',
      status        TEXT NOT NULL DEFAULT 'on_sale' CHECK (status IN ('on_sale','off_shelf')),
      created_at    TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS orders (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      order_no     TEXT NOT NULL UNIQUE,
      user_id      INTEGER NOT NULL REFERENCES users(id),
      total_amount REAL NOT NULL CHECK (total_amount >= 0),
      status       TEXT NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending','paid','shipped','completed','cancelled')),
      recipient    TEXT NOT NULL DEFAULT '',
      phone        TEXT NOT NULL DEFAULT '',
      address      TEXT NOT NULL DEFAULT '',
      created_at   TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id     INTEGER NOT NULL REFERENCES orders(id),
      product_id   INTEGER NOT NULL REFERENCES products(id),
      product_name TEXT NOT NULL,
      unit_price   REAL NOT NULL,
      quantity     INTEGER NOT NULL CHECK (quantity > 0),
      subtotal     REAL NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
    CREATE INDEX IF NOT EXISTS idx_products_status    ON products(status);
    CREATE INDEX IF NOT EXISTS idx_orders_user        ON orders(user_id);
    CREATE INDEX IF NOT EXISTS idx_order_items_order  ON order_items(order_id);
  `)
}

initSchema()

export default db
export { dbPath }
