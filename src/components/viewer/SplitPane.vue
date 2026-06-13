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
  /** Spectators in a session can't resize: dividers are inert. */
  readonly?: boolean
}>()

const container = useTemplateRef('container')

// Equal split: double-clicking a divider snaps it back to 50/50.
const DEFAULT_RATIO = 50

const { onPointerDown, onPointerMove, onPointerUp } = useDividerDrag({
  container,
  dir: () => props.node.dir,
  onRatio: (ratio) => props.onResize(props.path, ratio),
})

function resetRatio(): void {
  if (!props.readonly) props.onResize(props.path, DEFAULT_RATIO)
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
        :readonly="readonly"
      />
      <FrameView v-else :frame="node.a" :path="[...path, 'a']" />
    </div>
    <div
      class="divider"
      :class="{ inert: readonly }"
      role="separator"
      :aria-orientation="node.dir === 'h' ? 'vertical' : 'horizontal'"
      :title="readonly ? undefined : 'Double-clic : 50/50'"
      @pointerdown="!readonly && onPointerDown($event)"
      @pointermove="!readonly && onPointerMove($event)"
      @pointerup="!readonly && onPointerUp($event)"
      @pointercancel="!readonly && onPointerUp($event)"
      @dblclick="resetRatio"
    />
    <div class="pane">
      <SplitPane
        v-if="node.b.type === 'split'"
        :node="node.b"
        :path="[...path, 'b']"
        :on-resize="onResize"
        :readonly="readonly"
      />
      <FrameView v-else :frame="node.b" :path="[...path, 'b']" />
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

.row > .divider:not(.inert) {
  cursor: col-resize;
}

.column > .divider:not(.inert) {
  cursor: row-resize;
}

.divider.inert {
  cursor: default;
  pointer-events: none;
}

.divider:hover,
body.splitr-dragging .divider {
  background: var(--accent);
}
</style>
