<script setup lang="ts">
import { ref, watch } from 'vue'
import type { AddPosition } from '../../lib/tree'

// Presenter-only per-panel controls, tucked into a discreet top-right button so
// they don't cover the iframe. Opens a popover to retarget the URL, add a panel
// on any side, or remove this one.
const props = defineProps<{ url: string }>()
const emit = defineEmits<{
  setUrl: [url: string]
  add: [position: AddPosition]
  remove: []
}>()

const open = ref(false)
const draft = ref(props.url)
watch(
  () => props.url,
  (url) => {
    draft.value = url
  },
)

function submitUrl(): void {
  const value = draft.value.trim()
  if (value) emit('setUrl', value)
  open.value = false
}

function add(position: AddPosition): void {
  emit('add', position)
  open.value = false
}

function remove(): void {
  emit('remove')
  open.value = false
}
</script>

<template>
  <div class="panel-controls" :class="{ open }">
    <button class="trigger" title="Options du panneau" @click="open = !open">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="3" width="8" height="8" rx="1.5" fill="currentColor" opacity="0.9" />
        <rect x="13" y="3" width="8" height="8" rx="1.5" fill="currentColor" opacity="0.45" />
        <rect x="3" y="13" width="8" height="8" rx="1.5" fill="currentColor" opacity="0.45" />
        <rect x="13" y="13" width="8" height="8" rx="1.5" fill="currentColor" opacity="0.45" />
      </svg>
    </button>

    <div v-if="open" class="popover">
      <form class="url-row" @submit.prevent="submitUrl">
        <input
          v-model="draft"
          type="text"
          spellcheck="false"
          autocomplete="off"
          placeholder="https://…"
          aria-label="URL du panneau"
        />
        <button type="submit" title="Afficher pour tous">OK</button>
      </form>

      <p class="section">Ajouter un panneau</p>
      <div class="pad">
        <button class="up" title="Ajouter au-dessus" @click="add('top')">↑</button>
        <button class="left" title="Ajouter à gauche" @click="add('left')">←</button>
        <span class="center" aria-hidden="true" />
        <button class="right" title="Ajouter à droite" @click="add('right')">→</button>
        <button class="down" title="Ajouter en dessous" @click="add('bottom')">↓</button>
      </div>

      <button class="remove" title="Supprimer ce panneau" @click="remove">Supprimer ce panneau</button>
    </div>
  </div>
</template>

<style scoped>
.panel-controls {
  position: absolute;
  top: 6px;
  right: 6px;
  z-index: 6;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.3rem;
}

.trigger {
  padding: 0.3rem 0.35rem;
  color: var(--accent);
  background: rgba(15, 17, 21, 0.8);
  border-color: transparent;
  opacity: 0;
  transition: opacity 0.15s;
}

.trigger:hover,
.open .trigger {
  opacity: 1;
  border-color: var(--border);
}

.popover {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  padding: 0.6rem;
  width: 230px;
  background: var(--bg-raised);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
}

.url-row {
  display: flex;
  gap: 0.3rem;
}

.url-row input {
  flex: 1;
  min-width: 0;
  padding: 0.3rem 0.5rem;
  font-size: 0.82rem;
}

.url-row button {
  padding: 0.3rem 0.55rem;
  font-size: 0.82rem;
  color: var(--accent);
  border-color: var(--accent);
}

.section {
  margin: 0;
  font-size: 0.75rem;
  color: var(--text-dim);
  text-align: center;
}

.pad {
  display: grid;
  grid-template-columns: repeat(3, 34px);
  grid-template-rows: repeat(3, 34px);
  grid-template-areas:
    '. up .'
    'left center right'
    '. down .';
  gap: 0.25rem;
  justify-content: center;
}

.pad .up {
  grid-area: up;
}
.pad .left {
  grid-area: left;
}
.pad .right {
  grid-area: right;
}
.pad .down {
  grid-area: down;
}
.pad .center {
  grid-area: center;
}

.pad button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  padding: 0;
  font-size: 1rem;
  line-height: 1;
}

.remove {
  justify-content: center;
  padding: 0.35rem 0.5rem;
  font-size: 0.8rem;
  color: var(--danger);
  border-color: transparent;
}

.remove:hover {
  border-color: var(--danger);
}
</style>
