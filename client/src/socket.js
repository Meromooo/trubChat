import { io } from 'socket.io-client'

let socket = null

export const getSocket = (token) => {
  if (!socket) {
    socket = io(import.meta.env.VITE_SERVER_URL || 'http://localhost:4000', {
      auth: { token },
      autoConnect: false, // Chat.vue calls socket.connect() once the user is logged in
    })
  }
  return socket
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
