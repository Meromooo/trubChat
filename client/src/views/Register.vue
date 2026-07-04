<template>
  <div class="min-h-screen bg-gray-950 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-brand tracking-widest">trubChat</h1>
        <p class="text-gray-400 text-sm mt-1">Real-time chat</p>
      </div>

      <div class="bg-gray-900 border border-gray-800 rounded-2xl p-8">
        <h2 class="text-xl font-semibold text-white mb-6">Create account</h2>

        <form @submit.prevent="submit" class="space-y-4">
          <div>
            <label class="block text-sm text-gray-400 mb-1">Username</label>
            <input v-model="username" type="text" required placeholder="yourname"
              class="w-full bg-gray-800 border border-gray-800 rounded-lg px-4 py-2.5 text-white placeholder-gray-600
                     focus:outline-none focus:border-brand transition" />
          </div>
          <div>
            <label class="block text-sm text-gray-400 mb-1">Email</label>
            <input v-model="email" type="email" required placeholder="you@email.com"
              class="w-full bg-gray-800 border border-gray-800 rounded-lg px-4 py-2.5 text-white placeholder-gray-600
                     focus:outline-none focus:border-brand transition" />
          </div>
          <div>
            <label class="block text-sm text-gray-400 mb-1">Password</label>
            <input v-model="password" type="password" required placeholder="••••••••"
              class="w-full bg-gray-800 border border-gray-800 rounded-lg px-4 py-2.5 text-white placeholder-gray-600
                     focus:outline-none focus:border-brand transition" />
          </div>

          <p v-if="error" class="text-red-400 text-sm">{{ error }}</p>

          <button type="submit" :disabled="loading"
            class="w-full bg-brand hover:bg-red-700 disabled:opacity-50 text-white font-semibold
                   rounded-lg py-2.5 transition">
            {{ loading ? 'Creating account...' : 'Create account' }}
          </button>
        </form>

        <p class="text-center text-gray-400 text-sm mt-6">
          Already have an account?
          <router-link to="/login" class="text-brand hover:underline">Sign in</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const auth     = useAuthStore()
const router   = useRouter()
const username = ref('')
const email    = ref('')
const password = ref('')
const loading  = ref(false)
const error    = ref('')

const submit = async () => {
  loading.value = true
  error.value   = ''
  try {
    await auth.register(username.value, email.value, password.value)
    router.push('/chat')
  } catch (e) {
    // Server sends errors as { message: '...' } — fall back to a generic message if that's missing
    error.value = e.response?.data?.message || 'Registration failed'
  } finally {
    loading.value = false
  }
}
</script>
