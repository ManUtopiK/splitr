<script setup lang="ts">
// Presenter cursor as seen by spectators. x/y are container-relative [0..1].
defineProps<{ x: number; y: number }>()
</script>

<template>
  <div class="remote-cursor" :style="{ left: `${x * 100}%`, top: `${y * 100}%` }">
    <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
      <path
        d="M4 2 L4 17 L8 13 L11 20 L13.5 19 L10.5 12 L16 12 Z"
        fill="var(--accent, #58a6ff)"
        stroke="#fff"
        stroke-width="1.2"
        stroke-linejoin="round"
      />
    </svg>
    <span class="tag">présentateur</span>
  </div>
</template>

<style scoped>
.remote-cursor {
  position: absolute;
  z-index: 8;
  pointer-events: none;
  transform: translate(-2px, -2px);
  transition: left 0.08s linear, top 0.08s linear;
  will-change: left, top;
}

.tag {
  position: absolute;
  top: 18px;
  left: 14px;
  padding: 0.1rem 0.4rem;
  font-size: 0.7rem;
  white-space: nowrap;
  color: #fff;
  background: var(--accent, #58a6ff);
  border-radius: 4px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
}
</style>
