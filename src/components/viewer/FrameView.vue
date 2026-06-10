<script setup lang="ts">
import { onUnmounted, shallowRef, watchEffect } from 'vue'
import type { FrameNode } from '../../types'

const props = defineProps<{ frame: FrameNode }>()

// Cross-origin frames cannot be reloaded via contentWindow.location, so the
// auto-refresh option forces a remount by bumping the iframe :key.
const reloadTick = shallowRef(0)
let timer: ReturnType<typeof setInterval> | undefined

watchEffect(() => {
  clearInterval(timer)
  if (props.frame.refresh && props.frame.refresh > 0) {
    timer = setInterval(() => reloadTick.value++, props.frame.refresh * 1000)
  }
})

onUnmounted(() => clearInterval(timer))
</script>

<template>
  <iframe
    :key="reloadTick"
    :src="frame.url"
    :title="frame.url"
    allow="fullscreen"
    referrerpolicy="no-referrer"
  />
</template>

<style scoped>
iframe {
  border: 0;
  width: 100%;
  height: 100%;
  display: block;
  background: #fff;
}
</style>
