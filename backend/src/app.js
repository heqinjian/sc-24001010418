// Express application factory. All routes are mounted here as the project
// grows; S1 only ships a health-check route so the server can be verified.
import express from 'express'
import cors from 'cors'
import config from './config/index.js'
import { notFound, errorHandler } from './middleware/error.js'
import { seedIfEmpty } from './database/seed.js'
import productRoutes from './routes/products.js'
import categoryRoutes from './routes/categories.js'
import authRoutes from './routes/auth.js'
import orderRoutes from './routes/orders.js'
import adminRoutes from './routes/admin.js'

// Seed demo data on first boot (idempotent).
seedIfEmpty()

const app = express()

app.use(cors({ origin: config.frontendUrl, credentials: false }))
app.use(express.json())

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, data: { service: 'printhub-backend', status: 'ok' }, message: 'ok' })
})

app.use('/api/products', productRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/admin', adminRoutes)

app.use(notFound)
app.use(errorHandler)

export default app
