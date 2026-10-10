// Entry point. Import config first (loads env), then app.
import app from './src/app.js'
import config from './src/config/index.js'

app.listen(config.port, () => {
  console.log(`[printhub-backend] listening on http://localhost:${config.port} (env=${config.env})`)
})
