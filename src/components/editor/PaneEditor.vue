<script setup lang="ts">
import { computed, shallowRef, useTemplateRef } from 'vue'
import { useDividerDrag } from '../../composables/useDividerDrag'
import { useEditorTree } from '../../composables/useEditorTree'
import { IFRAME_ALLOW } from '../../lib/iframe'
import { normalizeUrl } from '../../lib/urlCodec'
import type { LayoutNode, NodePath } from '../../types'
import SplitLogo from '../SplitLogo.vue'
import PaneControls from './PaneControls.vue'
import PaneIntro from './PaneIntro.vue'

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

const url = computed(() => (props.node.type === 'frame' ? props.node.url : ''))
const isEmpty = computed(() => props.node.type === 'frame' && !props.node.url.trim())
// The very first (top-left) leaf has an all-'a' path; only it shows the hero.
const isFirstPane = computed(() => props.path.every((branch) => branch === 'a'))

// Inline preview: snapshot the current URL into an iframe that fills the pane.
// While previewing, the editor controls collapse into a top-right dropdown.
const previewSrc = shallowRef<string | null>(null)
const menuOpen = shallowRef(false)
function togglePreview(): void {
  const next = normalizeUrl(url.value)
  // Same URL already shown → close; otherwise show or re-apply the new URL.
  previewSrc.value = previewSrc.value && previewSrc.value === next ? null : next
  menuOpen.value = false
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
    <PaneEditor :node="node.a" :path="[...path, 'a']" :style="{ flexBasis: `${node.ratio}%` }" />
    <div
      class="gutter"
      role="separator"
      :aria-orientation="node.dir === 'h' ? 'vertical' : 'horizontal'"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
    />
    <PaneEditor :node="node.b" :path="[...path, 'b']" :style="{ flexBasis: `${100 - node.ratio}%` }" />
  </div>

  <!-- Frame: editable panel -->
  <div v-else class="pane" :class="{ previewing: !!previewSrc }">
    <!-- Preview mode: the iframe fills the pane; editing moves to a dropdown. -->
    <template v-if="previewSrc">
      <iframe
        class="preview"
        :src="previewSrc"
        title="preview"
        :allow="IFRAME_ALLOW"
        referrerpolicy="no-referrer"
      />
      <div class="pane-menu" :class="{ open: menuOpen }">
        <button class="menu-trigger" title="Modifier ce panneau" @click="menuOpen = !menuOpen">
          <SplitLogo :size="15" />
        </button>
        <div v-if="menuOpen" class="menu-panel">
          <PaneControls :node="node" :path="path" :preview-url="previewSrc" @toggle-preview="togglePreview" />
        </div>
      </div>
    </template>

    <!-- Edit mode: discovery intro (empty panes) + the configuration controls. -->
    <template v-else>
      <PaneIntro v-if="isEmpty" :default-help="!isFirstPane" />
      <PaneControls :node="node" :path="path" :preview-url="null" @toggle-preview="togglePreview" />
    </template>
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
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px dashed var(--border);
  border-radius: var(--radius);
  min-width: 0;
  min-height: 0;
  overflow: auto;
}

/* Preview fills the whole pane, no padding/border getting in the way. */
.pane.previewing {
  padding: 0;
  border-style: solid;
  overflow: hidden;
}

.preview {
  width: 100%;
  height: 100%;
  flex: 1;
  border: 0;
  border-radius: var(--radius);
  background: #fff;
}

.pane-menu {
  position: absolute;
  top: 6px;
  right: 6px;
  z-index: 5;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.3rem;
}

.menu-trigger {
  padding: 0.3rem 0.35rem;
  color: var(--accent);
  background: rgba(15, 17, 21, 0.8);
  border-color: transparent;
  opacity: 0.55;
  transition: opacity 0.15s;
}

.menu-trigger:hover,
.pane-menu.open .menu-trigger {
  opacity: 1;
  border-color: var(--border);
}

.menu-panel {
  width: 480px;
  max-width: 80vw;
  padding: 0.7rem;
  background: var(--bg-raised);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
}
</style>
