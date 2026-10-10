// Centralized configuration loaded from environment variables.
// In development we load backend/.env if present; in production the
// environment is expected to be configured externally.
import './env.js'

const config = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 3000,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  databasePath: process.env.DATABASE_PATH || './data/printhub.sqlite',
  jwtSecret: process.env.JWT_SECRET || 'dev-insecure-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '2h'
}

// Guard: in non-development, refuse to run with the default secret.
if (config.env !== 'development' && config.jwtSecret === 'dev-insecure-secret-change-me') {
  throw new Error('JWT_SECRET must be set in the environment for non-development runs.')
}

export default config
