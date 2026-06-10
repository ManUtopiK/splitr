<script setup lang="ts">
defineProps<{ size?: number }>()
</script>

<template>
  <svg
    :width="size ?? 22"
    :height="size ?? 22"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <rect x="1.5" y="3" width="9" height="18" rx="2" fill="currentColor" opacity="0.9" />
    <rect x="13.5" y="3" width="9" height="18" rx="2" fill="currentColor" opacity="0.45" />
  </svg>
</template>
