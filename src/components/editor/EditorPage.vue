<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { provideEditorTree } from '../../composables/useEditorTree'
import { normalizeLayout } from '../../lib/tree'
import { layoutToQuery } from '../../lib/urlCodec'
import type { LayoutNode } from '../../types'
import SplitLogo from '../SplitLogo.vue'
import HelpPanel from './HelpPanel.vue'
import PaneEditor from './PaneEditor.vue'
import SavedConfigs from './SavedConfigs.vue'

const props = defineProps<{ initialLayout: LayoutNode | null }>()

const tree = provideEditorTree(props.initialLayout)

const showHelp = shallowRef(false)
const copied = shallowRef(false)

/** Layout with every frame URL normalized (https:// prepended, etc.). */
const normalizedLayout = computed<LayoutNode | null>(() => normalizeLayout(tree.layout.value))

const ready = computed(() => normalizedLayout.value !== null)

const shareUrl = computed(() => {
  if (!normalizedLayout.value) return null
  const base = `${window.location.origin}${window.location.pathname}`
  return `${base}?${layoutToQuery(normalizedLayout.value)}`
})

async function copyUrl(): Promise<void> {
  if (!shareUrl.value) return
  await navigator.clipboard.writeText(shareUrl.value)
  copied.value = true
  setTimeout(() => (copied.value = false), 1500)
}

function open(): void {
  if (shareUrl.value) window.location.href = shareUrl.value
}
</script>

<template>
  <div class="editor">
    <header>
      <div class="brand">
        <SplitLogo class="logo" />
        <h1>splitr</h1>
      </div>
      <button :aria-expanded="showHelp" @click="showHelp = !showHelp">?&nbsp;Help</button>
      <div class="spacer" />
      <button :disabled="!ready" @click="copyUrl">
        {{ copied ? '✓ Copied' : 'Copy URL' }}
      </button>
      <button class="primary" :disabled="!ready" @click="open">Open</button>
    </header>

    <HelpPanel v-if="showHelp" />

    <main>
      <PaneEditor :node="tree.layout.value" :path="[]" />
    </main>

    <footer>
      <SavedConfigs />
      <a class="src" href="https://github.com/ManUtopiK/splitr" target="_blank" rel="noreferrer">source</a>
    </footer>
  </div>
</template>

<style scoped>
.editor {
  height: 100%;
  display: flex;
  flex-direction: column;
}

header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border);
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-right: 0.5rem;
}

.logo {
  color: var(--accent);
}

h1 {
  font-size: 1.15rem;
  letter-spacing: 0.04em;
}

.spacer {
  flex: 1;
}

main {
  flex: 1;
  min-height: 0;
  padding: 1rem;
  display: flex;
}

main > :deep(*) {
  flex: 1;
}

footer {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.6rem 1rem;
  border-top: 1px solid var(--border);
}

.src {
  margin-left: auto;
  color: var(--text-dim);
  font-size: 0.85rem;
}
</style>
