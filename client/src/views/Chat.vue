<template>
  <div class="flex h-screen bg-gray-950 overflow-hidden">

    <!-- Sidebar -->
    <aside class="w-72 bg-gray-900 border-r border-gray-800 flex flex-col flex-shrink-0">
      <!-- Header -->
      <div class="flex items-center justify-between px-5 py-4 border-b border-gray-800">
        <h1 class="text-lg font-bold text-brand tracking-widest">trubChat</h1>
        <button @click="auth.logout(); $router.push('/login')"
          class="text-gray-400 hover:text-white text-sm transition">Logout</button>
      </div>

      <!-- User info -->
      <div class="px-5 py-3 border-b border-gray-800">
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 rounded-full bg-green-400"></div>
          <span class="text-white text-sm font-medium">{{ auth.user?.username }}</span>
        </div>
      </div>

      <!-- Rooms -->
      <div class="flex-1 overflow-y-auto p-3">
        <div class="flex items-center justify-between mb-3 px-2">
          <span class="text-xs text-gray-400 uppercase tracking-wider">Rooms</span>
          <button @click="showCreate = true"
            class="text-brand hover:text-white text-lg leading-none transition">+</button>
        </div>

        <button v-for="room in chat.rooms" :key="room._id"
          @click="joinRoom(room)"
          :class="['w-full text-left px-3 py-2.5 rounded-lg mb-1 transition',
                   chat.activeRoom?._id === room._id
                     ? 'bg-brand/20 text-white'
                     : 'text-gray-400 hover:bg-gray-800 hover:text-white']">
          <span class="font-medium"># {{ room.name }}</span>
          <p v-if="room.description" class="text-xs text-gray-500 mt-0.5 truncate">{{ room.description }}</p>
        </button>

        <p v-if="!chat.rooms.length" class="text-gray-500 text-sm px-2">No rooms yet. Create one!</p>
      </div>
    </aside>

    <!-- Main chat area -->
    <main class="flex-1 flex flex-col overflow-hidden">

      <!-- No room selected -->
      <div v-if="!chat.activeRoom" class="flex-1 flex items-center justify-center">
        <div class="text-center">
          <p class="text-4xl mb-3">💬</p>
          <p class="text-white font-semibold">Select a room to start chatting</p>
          <p class="text-gray-400 text-sm mt-1">Or create a new one with the + button</p>
        </div>
      </div>

      <template v-else>
        <!-- Room header -->
        <div class="px-6 py-4 border-b border-gray-800 bg-gray-900 flex items-center gap-3">
          <div>
            <h2 class="font-semibold text-white"># {{ chat.activeRoom.name }}</h2>
            <p v-if="chat.activeRoom.description" class="text-gray-400 text-xs">{{ chat.activeRoom.description }}</p>
          </div>
        </div>

        <!-- Messages -->
        <div ref="messagesEl" class="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          <div v-if="chat.loading" class="text-gray-400 text-sm text-center">Loading messages...</div>

          <MessageBubble
            v-for="msg in chat.messages" :key="msg._id"
            :message="msg"
            :is-own="msg.sender._id === auth.user?.id || msg.sender === auth.user?.id" />

          <!-- Typing indicator -->
          <div v-if="chat.typingUsers.length" class="flex items-center gap-2 text-gray-400 text-sm">
            <div class="flex gap-1">
              <span class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style="animation-delay:0ms"></span>
              <span class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style="animation-delay:150ms"></span>
              <span class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style="animation-delay:300ms"></span>
            </div>
            <span>{{ chat.typingUsers.join(', ') }} {{ chat.typingUsers.length === 1 ? 'is' : 'are' }} typing...</span>
          </div>
        </div>

        <!-- Input -->
        <div class="px-6 py-4 border-t border-gray-800 bg-gray-900">
          <form @submit.prevent="sendMessage" class="flex gap-3">
            <input v-model="newMessage"
              @input="onTyping"
              @blur="stopTyping"
              :placeholder="`Message #${chat.activeRoom.name}`"
              class="flex-1 bg-gray-800 border border-gray-800 rounded-xl px-4 py-2.5 text-white placeholder-gray-600
                     focus:outline-none focus:border-brand transition" />
            <button type="submit"
              :disabled="!newMessage.trim()"
              class="bg-brand hover:bg-red-700 disabled:opacity-30 text-white px-5 rounded-xl font-medium transition">
              Send
            </button>
          </form>
        </div>
      </template>
    </main>

    <!-- Create room modal -->
    <div v-if="showCreate" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      @click.self="showCreate = false">
      <div class="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-sm mx-4">
        <h3 class="text-white font-semibold mb-4">Create a room</h3>
        <form @submit.prevent="createRoom" class="space-y-3">
          <input v-model="newRoom.name" placeholder="Room name" required
            class="w-full bg-gray-800 border border-gray-800 rounded-lg px-4 py-2.5 text-white placeholder-gray-600
                   focus:outline-none focus:border-brand transition" />
          <input v-model="newRoom.description" placeholder="Description (optional)"
            class="w-full bg-gray-800 border border-gray-800 rounded-lg px-4 py-2.5 text-white placeholder-gray-600
                   focus:outline-none focus:border-brand transition" />
          <div class="flex gap-2 pt-1">
            <button type="button" @click="showCreate = false"
              class="flex-1 bg-gray-800 border border-gray-800 text-gray-400 hover:text-white rounded-lg py-2 transition">
              Cancel
            </button>
            <button type="submit"
              class="flex-1 bg-brand hover:bg-red-700 text-white rounded-lg py-2 font-medium transition">
              Create
            </button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useChatStore } from '../stores/chat'
import { getSocket, disconnectSocket } from '../socket'
import MessageBubble from '../components/MessageBubble.vue'
import axios from 'axios'

const auth = useAuthStore()
const chat = useChatStore()

const newMessage  = ref('')
const showCreate  = ref(false)
const newRoom     = ref({ name: '', description: '' })
const messagesEl  = ref(null)
const typingTimer = ref(null)
const isTyping    = ref(false)

// Set axios auth header
axios.defaults.headers.common['Authorization'] = `Bearer ${auth.token}`

// Socket
const socket = getSocket(auth.token)

onMounted(async () => {
  await chat.fetchRooms()
  socket.connect()

  socket.on('message:new',   (msg)  => { chat.addMessage(msg); scrollBottom() })
  socket.on('typing:update', (data) => chat.setTyping(data))
  socket.on('user:online',   ({ userId }) => chat.setUserOnline(userId))
  socket.on('user:offline',  ({ userId }) => chat.setUserOffline(userId))
})

onUnmounted(() => {
  disconnectSocket()
})

const joinRoom = async (room) => {
  if (chat.activeRoom) socket.emit('room:leave', chat.activeRoom._id)
  chat.setActiveRoom(room)
  socket.emit('room:join', room._id)
  await chat.fetchMessages(room._id)
  scrollBottom()
}

const sendMessage = () => {
  if (!newMessage.value.trim() || !chat.activeRoom) return
  socket.emit('message:send', { roomId: chat.activeRoom._id, content: newMessage.value })
  stopTyping()
  newMessage.value = ''
}

const onTyping = () => {
  if (!isTyping.value) {
    isTyping.value = true
    socket.emit('typing:start', { roomId: chat.activeRoom._id })
  }
  clearTimeout(typingTimer.value)
  typingTimer.value = setTimeout(stopTyping, 1500)
}

const stopTyping = () => {
  if (isTyping.value && chat.activeRoom) {
    socket.emit('typing:stop', { roomId: chat.activeRoom._id })
    isTyping.value = false
  }
  clearTimeout(typingTimer.value)
}

const createRoom = async () => {
  if (!newRoom.value.name.trim()) return
  const room = await chat.createRoom(newRoom.value.name, newRoom.value.description)
  newRoom.value = { name: '', description: '' }
  showCreate.value = false
  joinRoom(room)
}

// Scrolls the messages panel to the newest message, after Vue updates the DOM
const scrollBottom = () => {
  nextTick(() => {
    if (messagesEl.value) messagesEl.value.scrollTop = messagesEl.value.scrollHeight
  })
}

watch(() => chat.messages.length, scrollBottom)
</script>
