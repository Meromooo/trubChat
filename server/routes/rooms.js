const router = require('express').Router()
const auth = require('../middleware/auth')
const Room = require('../models/Room')
const Message = require('../models/Message')

// GET /api/rooms — list all rooms (auth middleware blocks this if there's no valid token)
router.get('/', auth, async (req, res) => {
  try {
    // populate swaps the createdBy id for the actual username
    const rooms = await Room.find().populate('createdBy', 'username')
    res.json(rooms)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/rooms — create a room
router.post('/', auth, async (req, res) => {
  try {
    const { name, description } = req.body
    const room = await Room.create({ name, description, createdBy: req.user._id })
    res.status(201).json(room)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/rooms/:id/messages — load message history
router.get('/:id/messages', auth, async (req, res) => {
  try {
    const messages = await Message.find({ room: req.params.id })
      .populate('sender', 'username')
      .sort({ createdAt: 1 })
      .limit(100)
    res.json(messages)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
