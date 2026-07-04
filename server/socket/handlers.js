const jwt = require('jsonwebtoken')
const User = require('../models/User')
const Message = require('../models/Message')

const handleSocket = (io) => {
  // check the token before letting the socket connect, same idea as the auth middleware for routes
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token
    if (!token) return next(new Error('No token'))
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      socket.user = await User.findById(decoded.id).select('-password')
      next()
    } catch {
      next(new Error('Invalid token'))
    }
  })

  io.on('connection', async (socket) => {
    console.log(`${socket.user.username} connected`)

    // mark user online and tell everyone
    await User.findByIdAndUpdate(socket.user._id, { online: true })
    io.emit('user:online', { userId: socket.user._id, username: socket.user.username })

    // join/leave a chat room (this is a socket.io room, not our Room model)
    socket.on('room:join', (roomId) => {
      socket.join(roomId)
      console.log(`${socket.user.username} joined room ${roomId}`)
    })

    socket.on('room:leave', (roomId) => {
      socket.leave(roomId)
      console.log(`${socket.user.username} left room ${roomId}`)
    })

    // save the message then send it to everyone in the room
    socket.on('message:send', async ({ roomId, content }) => {
      if (!content?.trim() || !roomId) return
      try {
        const msg = await Message.create({ room: roomId, sender: socket.user._id, content })
        const populated = await msg.populate('sender', 'username') // so the client has the username to show
        io.to(roomId).emit('message:new', populated)
      } catch (err) {
        socket.emit('error', { message: 'Failed to send message' })
      }
    })

    // typing indicator, goes to everyone else in the room but not back to whoever is typing
    socket.on('typing:start', ({ roomId }) => {
      socket.to(roomId).emit('typing:update', { username: socket.user.username, isTyping: true })
    })

    socket.on('typing:stop', ({ roomId }) => {
      socket.to(roomId).emit('typing:update', { username: socket.user.username, isTyping: false })
    })

    socket.on('disconnect', async () => {
      await User.findByIdAndUpdate(socket.user._id, { online: false })
      io.emit('user:offline', { userId: socket.user._id })
      console.log(`${socket.user.username} disconnected`)
    })
  })
}

module.exports = { handleSocket }
