<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { clampRatio } from '../../lib/urlCodec'
import type { NodePath, SplitNode } from '../../types'
import FrameView from './FrameView.vue'

// Resizable binary split, inspired by nuxt/devtools NSplitPane: percentage
// flex-basis + pointer capture on the divider. Resize events bubble to
// ViewerPage through the forwarded onResize callback (recursive tree).
const props = defineProps<{
  node: SplitNode
  path: NodePath
  onResize: (path: NodePath, ratio: number) => void
}>()

const container = useTemplateRef('container')

let dragging = false

function onPointerDown(event: PointerEvent): void {
  dragging = true
  try {
    ;(event.target as HTMLElement).setPointerCapture(event.pointerId)
  } catch {
    // Capture is best-effort; the dragging flag drives the resize.
  }
  // Iframes swallow pointer events: disable them globally while dragging.
  document.body.classList.add('splitr-dragging')
}

function onPointerMove(event: PointerEvent): void {
  if (!dragging) return
  const rect = container.value?.getBoundingClientRect()
  if (!rect) return
  const ratio =
    props.node.dir === 'h'
      ? ((event.clientX - rect.left) / rect.width) * 100
      : ((event.clientY - rect.top) / rect.height) * 100
  props.onResize(props.path, clampRatio(ratio))
}

function onPointerUp(event: PointerEvent): void {
  dragging = false
  try {
    ;(event.target as HTMLElement).releasePointerCapture(event.pointerId)
  } catch {
    // ignore
  }
  document.body.classList.remove('splitr-dragging')
}
</script>

<template>
  <div ref="container" class="split" :class="node.dir === 'h' ? 'row' : 'column'">
    <div class="pane" :style="{ flexBasis: `${node.ratio}%` }">
      <SplitPane
        v-if="node.a.type === 'split'"
        :node="node.a"
        :path="[...path, 'a']"
        :on-resize="onResize"
      />
      <FrameView v-else :frame="node.a" />
    </div>
    <div
      class="divider"
      role="separator"
      :aria-orientation="node.dir === 'h' ? 'vertical' : 'horizontal'"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
    />
    <div class="pane">
      <SplitPane
        v-if="node.b.type === 'split'"
        :node="node.b"
        :path="[...path, 'b']"
        :on-resize="onResize"
      />
      <FrameView v-else :frame="node.b" />
    </div>
  </div>
</template>

<style scoped>
.split {
  display: flex;
  min-width: 0;
  min-height: 0;
}

.split.row {
  flex-direction: row;
}

.split.column {
  flex-direction: column;
}

.pane {
  flex: 1 1 0;
  min-width: 0;
  min-height: 0;
  display: flex;
}

.pane:first-child {
  flex-grow: 0;
  flex-shrink: 0;
}

.pane > :deep(*) {
  flex: 1;
  min-width: 0;
  min-height: 0;
}

.divider {
  flex: 0 0 6px;
  background: var(--border);
  transition: background 0.15s;
  touch-action: none;
}

.row > .divider {
  cursor: col-resize;
}

.column > .divider {
  cursor: row-resize;
}

.divider:hover,
body.splitr-dragging .divider {
  background: var(--accent);
}
</style>
