import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import Login    from '../views/Login.vue'
import Register from '../views/Register.vue'
import Chat     from '../views/Chat.vue'

const routes = [
  { path: '/',         redirect: '/chat' },
  { path: '/login',    component: Login },
  { path: '/register', component: Register },
  {
    path: '/chat',
    component: Chat,
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// send to login if the page needs auth and there's no token yet
router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.token) return '/login'
})

export default router
