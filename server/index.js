const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()

const authRoutes = require('./routes/auth')
const roomRoutes = require('./routes/rooms')
const { handleSocket } = require('./socket/handlers')

const app = express()
const server = http.createServer(app)

// Socket.io needs its own CORS setting — it doesn't share Express's `cors` middleware
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
})

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }))
app.use(express.json()) // parses JSON request bodies into req.body

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/rooms', roomRoutes)

app.get('/', (req, res) => res.json({ status: 'Pulse Chat server running' }))

// All socket.io connection/event logic lives in socket/handlers.js
handleSocket(io)

// Connect to MongoDB first, then start listening for requests
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected')
    server.listen(process.env.PORT || 4000, () =>
      console.log(`Server running on port ${process.env.PORT || 4000}`)
    )
  })
  .catch((err) => console.error('MongoDB error:', err))
