<script setup lang="ts">
import { computed } from 'vue'
import { useEditorTree } from '../../composables/useEditorTree'
import type { LayoutNode, NodePath } from '../../types'

// Editor controls for one frame: split, URL + preview toggle, size/refresh,
// remove. Rendered inline while configuring, or inside the per-pane dropdown
// once the iframe preview fills the pane.
const props = defineProps<{
  node: LayoutNode
  path: NodePath
  previewing: boolean
}>()
const emit = defineEmits<{ togglePreview: [] }>()

const tree = useEditorTree()

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
  <div class="controls">
    <div class="actions">
      <button title="Split into two columns" @click="tree.splitPane(path, 'h')">↔ split horizontal</button>
      <button title="Split into two rows" @click="tree.splitPane(path, 'v')">↕ split vertical</button>
      <button
        v-if="path.length > 0"
        class="danger"
        title="Remove this panel"
        @click="tree.removePane(path)"
      >
        ✕ remove
      </button>
    </div>

    <div class="url-row">
      <input
        v-model="url"
        type="text"
        class="url"
        placeholder="https://example.com"
        autocomplete="off"
        spellcheck="false"
      />
      <button class="show" :disabled="!url.trim()" @click="emit('togglePreview')">
        {{ previewing ? '✕ close' : '▶ Go!' }}
      </button>
    </div>

    <div class="options">
      <label v-if="share !== null">
        Size
        <input type="number" min="5" max="95" step="1" :value="Math.round(share)" @change="onShareInput" />
        %
      </label>
      <label>
        Refresh
        <input v-model.number="refresh" type="number" min="0" step="1" placeholder="0" />
        s
      </label>
    </div>
  </div>
</template>

<style scoped>
.controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.8rem;
  width: 100%;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
}

.url-row {
  display: flex;
  gap: 0.4rem;
  width: min(26rem, 100%);
}

.url {
  flex: 1;
  min-width: 0;
}

.show {
  flex-shrink: 0;
  white-space: nowrap;
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
