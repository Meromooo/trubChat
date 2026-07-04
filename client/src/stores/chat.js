import { defineStore } from 'pinia'
import axios from 'axios'

export const useChatStore = defineStore('chat', {
  state: () => ({
    rooms:       [],
    activeRoom:  null,   // the room currently open in the chat window
    messages:    [],     // messages for the active room only
    onlineUsers: [],     // user IDs currently connected, kept in sync via socket events
    typingUsers: [],     // usernames currently typing in the active room
    loading:     false,
  }),

  actions: {
    async fetchRooms() {
      const { data } = await axios.get('/api/rooms')
      this.rooms = data
    },

    async fetchMessages(roomId) {
      this.loading = true
      const { data } = await axios.get(`/api/rooms/${roomId}/messages`)
      this.messages = data
      this.loading  = false
    },

    async createRoom(name, description) {
      const { data } = await axios.post('/api/rooms', { name, description })
      this.rooms.unshift(data)
      return data
    },

    setActiveRoom(room) {
      this.activeRoom = room
      this.messages   = []
      this.typingUsers = []
    },

    addMessage(msg) {
      this.messages.push(msg)
    },

    setTyping({ username, isTyping }) {
      if (isTyping) {
        if (!this.typingUsers.includes(username)) this.typingUsers.push(username)
      } else {
        this.typingUsers = this.typingUsers.filter((u) => u !== username)
      }
    },

    setUserOnline(userId)  { if (!this.onlineUsers.includes(userId)) this.onlineUsers.push(userId) },
    setUserOffline(userId) { this.onlineUsers = this.onlineUsers.filter((id) => id !== userId) },
  },
})
