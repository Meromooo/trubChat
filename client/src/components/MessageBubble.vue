<template>
  <div :class="['flex gap-3', isOwn ? 'flex-row-reverse' : '']">
    <!-- Avatar -->
    <div class="w-8 h-8 rounded-full bg-brand/30 flex items-center justify-center flex-shrink-0 text-cream text-sm font-bold">
      {{ message.sender?.username?.[0]?.toUpperCase() || '?' }}
    </div>

    <div :class="['max-w-[70%]', isOwn ? 'items-end' : 'items-start', 'flex flex-col gap-1']">
      <div class="flex items-baseline gap-2" :class="isOwn ? 'flex-row-reverse' : ''">
        <span class="text-xs text-gray-400 font-medium">{{ message.sender?.username }}</span>
        <span class="text-xs text-gray-500">{{ formatTime(message.createdAt) }}</span>
      </div>
      <div :class="['px-4 py-2.5 rounded-2xl text-sm leading-relaxed',
                    isOwn
                      ? 'bg-brand text-cream rounded-tr-sm'
                      : 'bg-gray-800 text-gray-200 rounded-tl-sm']">
        {{ message.content }}
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  message: { type: Object, required: true },
  isOwn:   { type: Boolean, default: false },
})

// Formats a timestamp like "3:45 PM" for display under each message
const formatTime = (ts) => {
  if (!ts) return ''
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
</script>
