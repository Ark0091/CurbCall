const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || 'curbcall-dev-secret'

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing bearer token' })
  }

  const token = authHeader.slice('Bearer '.length)

  try {
    req.user = jwt.verify(token, JWT_SECRET)
    return next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

const authorizeAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' })
  }

  return next()
}

module.exports = {
  JWT_SECRET,
  authenticate,
  authorizeAdmin,
}
