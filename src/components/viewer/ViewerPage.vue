<script setup lang="ts">
import { shallowRef } from 'vue'
import { applyRatios, collectRatios, setRatioAt } from '../../lib/tree'
import { clearSizes, loadSizes, saveSizes } from '../../lib/storage'
import { encodeLayout, layoutToQuery } from '../../lib/urlCodec'
import type { LayoutNode, NodePath } from '../../types'
import CornerMenu from './CornerMenu.vue'
import FrameView from './FrameView.vue'
import SplitPane from './SplitPane.vue'

const props = defineProps<{ layout: LayoutNode }>()

// Sizes are remembered per shared URL: the canonical query is the storage key.
const urlKey = layoutToQuery(props.layout)
const display = shallowRef<LayoutNode>(applyRatios(props.layout, loadSizes(urlKey) ?? {}))

function onResize(path: NodePath, ratio: number): void {
  display.value = setRatioAt(display.value, path, ratio)
  saveSizes(urlKey, collectRatios(display.value))
}

function edit(): void {
  window.location.href = `${window.location.pathname}?edit=1&l=${encodeLayout(display.value)}`
}

async function copyUrl(): Promise<void> {
  const base = `${window.location.origin}${window.location.pathname}`
  await navigator.clipboard.writeText(`${base}?${layoutToQuery(display.value)}`)
}

function toggleFullscreen(): void {
  if (document.fullscreenElement) void document.exitFullscreen()
  else void document.documentElement.requestFullscreen()
}

function resetSizes(): void {
  clearSizes(urlKey)
  display.value = props.layout
}
</script>

<template>
  <div class="viewer">
    <SplitPane v-if="display.type === 'split'" :node="display" :path="[]" :on-resize="onResize" />
    <FrameView v-else :frame="display" />
    <CornerMenu
      @edit="edit"
      @copy="copyUrl"
      @fullscreen="toggleFullscreen"
      @reset="resetSizes"
    />
  </div>
</template>

<style scoped>
.viewer {
  height: 100%;
  display: flex;
}

.viewer > :deep(*) {
  flex: 1;
  min-width: 0;
  min-height: 0;
}
</style>
