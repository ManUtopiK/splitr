<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'

// Shown to spectators until the presenter's scheduled start time. The clock is
// each viewer's own (some skew is expected and fine).
const props = defineProps<{ startAt: number; title: string }>()

const now = ref(Date.now())
const timer = setInterval(() => (now.value = Date.now()), 1000)
onUnmounted(() => clearInterval(timer))

const parts = computed(() => {
  const total = Math.floor(Math.max(0, props.startAt - now.value) / 1000)
  return {
    d: Math.floor(total / 86400),
    h: Math.floor((total % 86400) / 3600),
    m: Math.floor((total % 3600) / 60),
    s: total % 60,
  }
})

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

const startLabel = computed(() => new Date(props.startAt).toLocaleString())
</script>

<template>
  <div class="countdown">
    <p class="kicker">Starts in</p>
    <p class="time">
      <span v-if="parts.d">{{ parts.d }}d </span>{{ pad(parts.h) }}:{{ pad(parts.m) }}:{{ pad(parts.s) }}
    </p>
    <p class="title">{{ title || 'splitr session' }}</p>
    <p class="when">{{ startLabel }}</p>
  </div>
</template>

<style scoped>
.countdown {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  text-align: center;
  padding: 2rem;
  background: var(--bg);
}

.kicker {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.85rem;
  color: var(--text-dim);
}

.time {
  margin: 0;
  font-size: clamp(2.5rem, 9vw, 5rem);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--accent);
  line-height: 1.1;
}

.title {
  margin: 0.6rem 0 0;
  font-size: 1.1rem;
  color: var(--text);
}

.when {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-dim);
}
</style>
