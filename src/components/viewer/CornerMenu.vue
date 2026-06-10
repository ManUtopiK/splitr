<script setup lang="ts">
import { shallowRef } from 'vue'
import SplitLogo from '../SplitLogo.vue'

const emit = defineEmits<{
  edit: []
  copy: []
  fullscreen: []
  reset: []
}>()

const open = shallowRef(false)
const copied = shallowRef(false)

function copy(): void {
  emit('copy')
  copied.value = true
  setTimeout(() => {
    copied.value = false
    open.value = false
  }, 900)
}

function onEdit(): void {
  emit('edit')
  open.value = false
}

function onFullscreen(): void {
  emit('fullscreen')
  open.value = false
}

function onReset(): void {
  emit('reset')
  open.value = false
}
</script>

<template>
  <div class="corner" :class="{ open }">
    <button class="trigger" title="splitr menu" @click="open = !open">
      <SplitLogo :size="16" />
    </button>
    <nav v-if="open">
      <button @click="onEdit">Edit layout</button>
      <button @click="copy">{{ copied ? '✓ Copied' : 'Copy URL' }}</button>
      <button @click="onFullscreen">Fullscreen</button>
      <button @click="onReset">Reset sizes</button>
    </nav>
  </div>
</template>

<style scoped>
.corner {
  position: fixed;
  top: 6px;
  left: 6px;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.trigger {
  padding: 0.3rem 0.4rem;
  color: var(--accent);
  background: rgba(15, 17, 21, 0.55);
  border-color: transparent;
  opacity: 0.35;
  transition: opacity 0.15s;
}

.trigger:hover,
.open .trigger {
  opacity: 1;
  border-color: var(--border);
}

nav {
  display: flex;
  flex-direction: column;
  background: var(--bg-raised);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
}

nav button {
  border: none;
  border-radius: 0;
  justify-content: flex-start;
  padding: 0.55rem 0.9rem;
  background: transparent;
  white-space: nowrap;
}

nav button:hover {
  background: var(--accent-soft);
}
</style>
