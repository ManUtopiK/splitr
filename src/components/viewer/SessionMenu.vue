<script setup lang="ts">
import { shallowRef } from 'vue'
import SplitLogo from '../SplitLogo.vue'

defineProps<{
  isPresenter: boolean
  participants: number
  connected: boolean
  pointerMode: boolean
}>()

const emit = defineEmits<{
  copyLink: []
  copyCoPresenter: []
  copyUrls: []
  fullscreen: []
  togglePointer: []
  leave: []
}>()

const open = shallowRef(false)
const copied = shallowRef(false)
const copiedCo = shallowRef(false)
const copiedUrls = shallowRef(false)

function copy(): void {
  emit('copyLink')
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 1200)
}

function copyCoPresenter(): void {
  emit('copyCoPresenter')
  copiedCo.value = true
  setTimeout(() => {
    copiedCo.value = false
  }, 1200)
}

function copyUrls(): void {
  emit('copyUrls')
  copiedUrls.value = true
  setTimeout(() => {
    copiedUrls.value = false
  }, 1200)
}
</script>

<template>
  <div class="corner" :class="{ open }">
    <div class="bar">
      <button class="trigger" :title="isPresenter ? 'Session (présentateur)' : 'Session'" @click="open = !open">
        <SplitLogo :size="16" />
        <span class="dot" :class="{ live: connected }" />
      </button>
      <button
        v-if="isPresenter"
        class="ptr"
        :class="{ active: pointerMode }"
        :title="pointerMode ? 'Mode pointeur actif' : 'Mode pointeur'"
        @click="emit('togglePointer')"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 2 L5 19 L9.2 15 L12.4 22 L15 20.9 L11.8 14 L18 14 Z" fill="currentColor" />
        </svg>
      </button>
    </div>
    <nav v-if="open">
      <p class="status">
        <strong>{{ isPresenter ? 'Présentateur' : 'Spectateur' }}</strong>
        <span>{{ participants }} {{ participants > 1 ? 'participants' : 'participant' }}</span>
        <span class="hint">{{ connected ? 'connecté' : 'en attente de pairs…' }}</span>
      </p>
      <button v-if="isPresenter" @click="copy">{{ copied ? '✓ Lien copié' : 'Copier le lien spectateur' }}</button>
      <button v-if="isPresenter" @click="copyCoPresenter">
        {{ copiedCo ? '✓ Lien copié' : 'Copier le lien co-présentateur' }}
      </button>
      <button @click="copyUrls">{{ copiedUrls ? '✓ URLs copiées' : 'Copier les URLs des iframes' }}</button>
      <button @click="emit('fullscreen')">Plein écran</button>
      <button @click="emit('leave')">Quitter la session</button>
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
  align-items: flex-start;
  gap: 0.3rem;
}

.bar {
  display: flex;
  gap: 0.3rem;
}

.trigger,
.ptr {
  position: relative;
  display: flex;
  align-items: center;
  padding: 0.3rem 0.4rem;
  color: var(--accent);
  background: rgba(15, 17, 21, 0.55);
  border-color: transparent;
  opacity: 0.45;
  transition: opacity 0.15s;
}

.trigger:hover,
.ptr:hover,
.open .trigger {
  opacity: 1;
  border-color: var(--border);
  background: rgba(15, 17, 21, 1);
}

.ptr.active {
  opacity: 1;
  color: #fff;
  background: var(--accent);
  border-color: var(--accent);
}

.dot {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--text-muted, #888);
}

.dot.live {
  background: #3fb950;
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

.status {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  padding: 0.55rem 0.9rem;
  margin: 0;
  border-bottom: 1px solid var(--border);
  font-size: 0.85em;
  white-space: nowrap;
}

.status .hint {
  color: var(--text-muted, #888);
  font-size: 0.92em;
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
