<script setup lang="ts">
import { ref } from 'vue'

// Spectator gate: the presenter required a name before the layout is shown.
const props = defineProps<{ initial: string }>()
const emit = defineEmits<{ submit: [name: string] }>()

const name = ref(props.initial)

function submit(): void {
  const value = name.value.trim()
  if (value) emit('submit', value)
}
</script>

<template>
  <form class="gate" @submit.prevent="submit">
    <h2>Join the session</h2>
    <p>Enter your name to continue.</p>
    <input
      v-model="name"
      type="text"
      placeholder="Your name"
      autocomplete="name"
      spellcheck="false"
    />
    <button class="primary" type="submit" :disabled="!name.trim()">Join</button>
  </form>
</template>

<style scoped>
.gate {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  text-align: center;
  padding: 2rem;
  background: var(--bg);
}

h2 {
  margin: 0;
  font-size: 1.4rem;
  color: var(--text);
}

p {
  margin: 0;
  color: var(--text-dim);
}

input {
  width: min(20rem, 90%);
  margin-top: 0.4rem;
  padding: 0.5rem 0.7rem;
  font-size: 1rem;
}

.primary {
  padding: 0.5rem 1.4rem;
}
</style>
