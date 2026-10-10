// Unified error handling. Never leak stack traces or internal details.
export function notFound(req, res) {
  res.status(404).json({ success: false, message: `Not found: ${req.method} ${req.path}`, code: 'NOT_FOUND' })
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const status = err.status || 500
  const message = err.expose ? err.message : 'Internal server error'
  if (status >= 500) {
    // Log full detail server-side, return generic message to client.
    console.error('[error]', err)
  }
  res.status(status).json({ success: false, message, code: err.code || 'INTERNAL_ERROR' })
}
