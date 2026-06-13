<script setup lang="ts">
import { ref } from 'vue'

// Header dropdown to launch a presenter session from the editor: it hands the
// current layout to the live session (the parent builds the room URL).
defineProps<{ disabled: boolean }>()
const emit = defineEmits<{ start: [signal: string] }>()

const open = ref(false)
const signal = ref('')

function start(): void {
  emit('start', signal.value.trim())
  open.value = false
}
</script>

<template>
  <div class="presenter" :class="{ open }">
    <button class="trigger" :disabled="disabled" @click="open = !open">Present ▾</button>
    <div v-if="open" class="panel">
      <p class="title">Presenter session</p>
      <p class="desc">
        Drive the layout, panel URLs and a shared cursor live for everyone. Peer-to-peer, no account.
      </p>
      <label class="field">
        Signaling server <span class="opt">(optional)</span>
        <input
          v-model="signal"
          type="text"
          placeholder="wss://signaling.yjs.dev"
          spellcheck="false"
          autocomplete="off"
        />
      </label>
      <button class="primary" @click="start">Enter presenter mode</button>
    </div>
  </div>
</template>

<style scoped>
.presenter {
  position: relative;
}

.panel {
  position: absolute;
  top: calc(100% + 0.4rem);
  right: 0;
  z-index: 20;
  width: 280px;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding: 0.8rem;
  background: var(--bg-raised);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
}

.title {
  margin: 0;
  font-weight: 600;
}

.desc {
  margin: 0;
  font-size: 0.85rem;
  color: var(--text-dim);
  line-height: 1.45;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  font-size: 0.82rem;
  color: var(--text-dim);
}

.opt {
  opacity: 0.7;
}

.field input {
  padding: 0.35rem 0.5rem;
  font-size: 0.85rem;
}

.panel .primary {
  margin-top: 0.1rem;
}
</style>
