const jwt = require('jsonwebtoken')
const User = require('../models/User')

// Protects routes: checks for a valid "Bearer <token>" header before letting the request through
module.exports = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] // "Bearer abc123" -> "abc123"
  if (!token) return res.status(401).json({ message: 'No token provided' })

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) // throws if invalid/expired
    req.user = await User.findById(decoded.id).select('-password') // '-password' excludes it from the result
    next()
  } catch {
    res.status(401).json({ message: 'Invalid token' })
  }
}
