<script setup lang="ts">
import { computed, useTemplateRef } from 'vue'
import { useDividerDrag } from '../../composables/useDividerDrag'
import { useEditorTree } from '../../composables/useEditorTree'
import type { LayoutNode, NodePath } from '../../types'

const props = defineProps<{
  node: LayoutNode
  path: NodePath
}>()

const tree = useEditorTree()

// Drag handle between the two children: updates the split ratio live,
// which the size % fields reflect (they derive from the tree).
const container = useTemplateRef('container')

const { onPointerDown, onPointerMove, onPointerUp } = useDividerDrag({
  container,
  dir: () => (props.node.type === 'split' ? props.node.dir : 'h'),
  onRatio: (ratio) => tree.setRatio(props.path, ratio),
})

const share = computed(() => tree.getShare(props.path))

const url = computed({
  get: () => (props.node.type === 'frame' ? props.node.url : ''),
  set: (value: string) => tree.updateFrame(props.path, { url: value }),
})

const refresh = computed({
  get: () => (props.node.type === 'frame' ? (props.node.refresh ?? 0) : 0),
  set: (value: number) => tree.updateFrame(props.path, { refresh: value }),
})

function onShareInput(event: Event): void {
  const pct = Number((event.target as HTMLInputElement).value)
  if (Number.isFinite(pct) && pct > 0 && pct < 100) tree.setShare(props.path, pct)
}
</script>

<template>
  <!-- Split: recurse into both children, laid out like the final result -->
  <div
    v-if="node.type === 'split'"
    ref="container"
    class="split"
    :class="node.dir === 'h' ? 'row' : 'column'"
  >
    <PaneEditor
      :node="node.a"
      :path="[...path, 'a']"
      :style="{ flexBasis: `${node.ratio}%` }"
    />
    <div
      class="gutter"
      role="separator"
      :aria-orientation="node.dir === 'h' ? 'vertical' : 'horizontal'"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
    />
    <PaneEditor
      :node="node.b"
      :path="[...path, 'b']"
      :style="{ flexBasis: `${100 - node.ratio}%` }"
    />
  </div>

  <!-- Frame: editable panel -->
  <div v-else class="pane">
    <div class="actions">
      <button title="Split into two columns" @click="tree.splitPane(path, 'h')">
        ↔ split horizontal
      </button>
      <button title="Split into two rows" @click="tree.splitPane(path, 'v')">
        ↕ split vertical
      </button>
      <button
        v-if="path.length > 0"
        class="danger"
        title="Remove this panel"
        @click="tree.removePane(path)"
      >
        ✕ remove
      </button>
    </div>
    <input
      v-model="url"
      type="text"
      class="url"
      placeholder="https://example.com"
      autocomplete="off"
      spellcheck="false"
    />
    <div class="options">
      <label v-if="share !== null">
        size
        <input
          type="number"
          min="5"
          max="95"
          step="1"
          :value="Math.round(share)"
          @change="onShareInput"
        />
        %
      </label>
      <label>
        refresh
        <input v-model.number="refresh" type="number" min="0" step="1" placeholder="0" />
        s
      </label>
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

.split > .pane,
.split > .split {
  flex-grow: 1;
  flex-shrink: 1;
}

.gutter {
  flex: 0 0 6px;
  background: var(--border);
  border-radius: 3px;
  margin: 2px;
  touch-action: none;
  transition: background 0.15s;
}

.row > .gutter {
  cursor: col-resize;
}

.column > .gutter {
  cursor: row-resize;
}

.gutter:hover,
body.splitr-dragging .gutter {
  background: var(--accent);
}

.pane {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  padding: 1rem;
  border: 1px dashed var(--border);
  border-radius: var(--radius);
  min-width: 0;
  min-height: 0;
  overflow: auto;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
}

.url {
  width: min(26rem, 100%);
}

.options {
  display: flex;
  flex-wrap: wrap;
  gap: 1.2rem;
  color: var(--text-dim);
  font-size: 0.88rem;
}

.options label {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}
</style>
