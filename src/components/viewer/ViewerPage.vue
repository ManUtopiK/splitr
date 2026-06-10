<script setup lang="ts">
import { shallowRef, watchEffect } from 'vue'
import { applyRatios, collectRatios, listFrames, setRatioAt } from '../../lib/tree'
import { clearSizes, loadSizes, saveSizes } from '../../lib/storage'
import { layoutToQuery } from '../../lib/urlCodec'
import { useTabSync } from '../../composables/useTabSync'
import type { LayoutNode, NodePath } from '../../types'
import CornerMenu from './CornerMenu.vue'
import FrameView from './FrameView.vue'
import SplitPane from './SplitPane.vue'

const props = defineProps<{ layout: LayoutNode; title?: string }>()

// Sizes are remembered per shared URL: the canonical query is the storage key.
const urlKey = layoutToQuery(props.layout, props.title)
const display = shallowRef<LayoutNode>(applyRatios(props.layout, loadSizes(urlKey) ?? {}))

// Optional live sync of resizes across tabs showing this same URL.
const { enabled: syncTabs, setEnabled: setSyncTabs, broadcast } = useTabSync(urlKey, (ratios) => {
  display.value = ratios ? applyRatios(props.layout, ratios) : props.layout
})

// Custom title when provided (?t=), otherwise the embedded hosts.
watchEffect(() => {
  document.title =
    props.title?.trim() ||
    listFrames(display.value)
      .map(({ frame }) => {
        try {
          return new URL(frame.url).host
        } catch {
          return frame.url
        }
      })
      .join(' | ')
})

function onResize(path: NodePath, ratio: number): void {
  display.value = setRatioAt(display.value, path, ratio)
  const ratios = collectRatios(display.value)
  saveSizes(urlKey, ratios)
  broadcast(ratios)
}

function edit(): void {
  window.location.href = `${window.location.pathname}?edit=1&${layoutToQuery(display.value, props.title)}`
}

async function copyUrl(): Promise<void> {
  const base = `${window.location.origin}${window.location.pathname}`
  await navigator.clipboard.writeText(`${base}?${layoutToQuery(display.value, props.title)}`)
}

function toggleFullscreen(): void {
  if (document.fullscreenElement) void document.exitFullscreen()
  else void document.documentElement.requestFullscreen()
}

function resetSizes(): void {
  clearSizes(urlKey)
  display.value = props.layout
  broadcast(null)
}
</script>

<template>
  <div class="viewer">
    <SplitPane v-if="display.type === 'split'" :node="display" :path="[]" :on-resize="onResize" />
    <FrameView v-else :frame="display" />
    <CornerMenu
      :sync-tabs="syncTabs"
      @edit="edit"
      @copy="copyUrl"
      @fullscreen="toggleFullscreen"
      @reset="resetSizes"
      @toggle-sync="setSyncTabs"
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
