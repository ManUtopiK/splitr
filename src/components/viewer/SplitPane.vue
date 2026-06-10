<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { useDividerDrag } from '../../composables/useDividerDrag'
import type { NodePath, SplitNode } from '../../types'
import FrameView from './FrameView.vue'

// Resizable binary split, inspired by nuxt/devtools NSplitPane: percentage
// flex-basis + pointer drag on the divider. Resize events bubble to
// ViewerPage through the forwarded onResize callback (recursive tree).
const props = defineProps<{
  node: SplitNode
  path: NodePath
  onResize: (path: NodePath, ratio: number) => void
}>()

const container = useTemplateRef('container')

const { onPointerDown, onPointerMove, onPointerUp } = useDividerDrag({
  container,
  dir: () => props.node.dir,
  onRatio: (ratio) => props.onResize(props.path, ratio),
})
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
