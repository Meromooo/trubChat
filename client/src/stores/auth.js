import { defineStore } from 'pinia'
import axios from 'axios'

export const useAuthStore = defineStore('auth', {
  // read from localStorage so the user is still logged in after a page refresh
  state: () => ({
    user:  JSON.parse(localStorage.getItem('pc_user') || 'null'),
    token: localStorage.getItem('pc_token') || null,
    error: null,
  }),

  actions: {
    async login(email, password) {
      this.error = null
      const { data } = await axios.post('/api/auth/login', { email, password })
      this.token = data.token
      this.user  = data.user
      localStorage.setItem('pc_token', data.token)
      localStorage.setItem('pc_user',  JSON.stringify(data.user))
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
    },

    async register(username, email, password) {
      this.error = null
      const { data } = await axios.post('/api/auth/register', { username, email, password })
      this.token = data.token
      this.user  = data.user
      localStorage.setItem('pc_token', data.token)
      localStorage.setItem('pc_user',  JSON.stringify(data.user))
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
    },

    logout() {
      this.token = null
      this.user  = null
      localStorage.removeItem('pc_token')
      localStorage.removeItem('pc_user')
    },
  },
})
