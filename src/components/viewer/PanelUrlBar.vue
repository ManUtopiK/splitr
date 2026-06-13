<script setup lang="ts">
import { ref, watch } from 'vue'

// Presenter-only inline URL editor, revealed on panel hover. Lets the presenter
// retarget a single iframe without opening the editor; spectators receive the
// change as a "switch" banner.
const props = defineProps<{ url: string }>()
const emit = defineEmits<{ submit: [url: string] }>()

const draft = ref(props.url)
watch(
  () => props.url,
  (url) => {
    draft.value = url
  },
)

function submit(): void {
  const value = draft.value.trim()
  if (value) emit('submit', value)
}
</script>

<template>
  <form class="url-bar" @submit.prevent="submit">
    <input
      v-model="draft"
      type="text"
      spellcheck="false"
      autocomplete="off"
      placeholder="https://…"
      aria-label="URL du panneau"
    />
    <button type="submit" title="Afficher pour tous">Afficher</button>
  </form>
</template>

<style scoped>
.url-bar {
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  width: min(90%, 520px);
  display: flex;
  gap: 0.3rem;
  padding: 0.35rem;
  background: var(--bg-raised, #1a1d23);
  border: 1px solid var(--border, #333);
  border-radius: var(--radius, 8px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.45);
  opacity: 0;
  transition: opacity 0.15s;
  pointer-events: none;
  z-index: 6;
}

.url-bar:focus-within {
  opacity: 1;
  pointer-events: auto;
}

input {
  flex: 1;
  min-width: 0;
  padding: 0.3rem 0.5rem;
  font-size: 0.85rem;
}

button {
  padding: 0.3rem 0.7rem;
  font-size: 0.85rem;
  color: var(--accent, #58a6ff);
  border-color: var(--accent, #58a6ff);
}
</style>
