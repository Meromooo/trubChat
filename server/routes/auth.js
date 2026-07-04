const router = require('express').Router()
const jwt = require('jsonwebtoken')
const User = require('../models/User')

// POST /api/auth/register — create a new account
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body
    if (!username || !email || !password)
      return res.status(400).json({ message: 'All fields required' })

    const exists = await User.findOne({ $or: [{ email }, { username }] })
    if (exists) return res.status(409).json({ message: 'User already exists' })

    // password gets hashed automatically in models/User.js before this saves
    const user = await User.create({ username, email, password })

    // make a token so the user stays logged in without typing their password again
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })
    res.status(201).json({ token, user: { id: user._id, username: user.username, email: user.email } })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: 'Invalid credentials' })

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })
    res.json({ token, user: { id: user._id, username: user.username, email: user.email } })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
