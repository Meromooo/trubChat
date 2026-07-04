import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css'
import axios from 'axios'

// In production, point axios directly to the Render server
// In dev, leave empty so Vite's proxy handles /api → localhost:4000
if (import.meta.env.VITE_SERVER_URL) {
  axios.defaults.baseURL = import.meta.env.VITE_SERVER_URL
}

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
