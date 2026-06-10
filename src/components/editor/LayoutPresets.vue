<script setup lang="ts">
import { computed } from 'vue'
import { useEditorTree } from '../../composables/useEditorTree'
import { listFrames, makeFrame, makeSplit } from '../../lib/tree'
import type { LayoutNode } from '../../types'

const tree = useEditorTree()

/** Next-frame factory: reuses the URLs already typed, in reading order. */
type FrameFactory = () => LayoutNode

interface Preset {
  id: string
  title: string
  /** Rectangles of the icon, in a 20x14 viewBox. */
  rects: { x: number; y: number; w: number; h: number }[]
  build: (frame: FrameFactory) => LayoutNode
}

const presets: Preset[] = [
  {
    id: 'cols',
    title: 'Two columns',
    rects: [
      { x: 0, y: 0, w: 9.5, h: 14 },
      { x: 10.5, y: 0, w: 9.5, h: 14 },
    ],
    build: (frame) => makeSplit('h', frame(), frame()),
  },
  {
    id: 'rows',
    title: 'Two rows',
    rects: [
      { x: 0, y: 0, w: 20, h: 6.5 },
      { x: 0, y: 7.5, w: 20, h: 6.5 },
    ],
    build: (frame) => makeSplit('v', frame(), frame()),
  },
  {
    id: 'main-right',
    title: 'Main + two on the right',
    rects: [
      { x: 0, y: 0, w: 12.5, h: 14 },
      { x: 13.5, y: 0, w: 6.5, h: 6.5 },
      { x: 13.5, y: 7.5, w: 6.5, h: 6.5 },
    ],
    build: (frame) => makeSplit('h', frame(), makeSplit('v', frame(), frame()), 65),
  },
  {
    id: 'main-bottom',
    title: 'Main + two below',
    rects: [
      { x: 0, y: 0, w: 20, h: 8 },
      { x: 0, y: 9, w: 9.5, h: 5 },
      { x: 10.5, y: 9, w: 9.5, h: 5 },
    ],
    build: (frame) => makeSplit('v', frame(), makeSplit('h', frame(), frame()), 65),
  },
  {
    id: 'grid',
    title: 'Four panels (2 × 2)',
    rects: [
      { x: 0, y: 0, w: 9.5, h: 6.5 },
      { x: 10.5, y: 0, w: 9.5, h: 6.5 },
      { x: 0, y: 7.5, w: 9.5, h: 6.5 },
      { x: 10.5, y: 7.5, w: 9.5, h: 6.5 },
    ],
    build: (frame) =>
      makeSplit('h', makeSplit('v', frame(), frame()), makeSplit('v', frame(), frame())),
  },
]

/** Structure signature ignoring URLs and ratios, to highlight the active preset. */
function shape(node: LayoutNode): string {
  if (node.type === 'frame') return 'f'
  return `${node.dir}(${shape(node.a)},${shape(node.b)})`
}

const activeShape = computed(() => shape(tree.layout.value))

function shapeOf(preset: Preset): string {
  return shape(preset.build(() => makeFrame()))
}

function apply(preset: Preset): void {
  const urls = listFrames(tree.layout.value).map(({ frame }) => frame.url)
  let index = 0
  tree.setLayout(preset.build(() => makeFrame(urls[index++] ?? '')))
}
</script>

<template>
  <div class="presets" role="group" aria-label="Layout presets">
    <button
      v-for="preset in presets"
      :key="preset.id"
      class="preset"
      :class="{ active: shapeOf(preset) === activeShape }"
      :title="preset.title"
      @click="apply(preset)"
    >
      <svg width="20" height="14" viewBox="0 0 20 14" aria-hidden="true">
        <rect
          v-for="(rect, i) in preset.rects"
          :key="i"
          :x="rect.x"
          :y="rect.y"
          :width="rect.w"
          :height="rect.h"
          rx="1"
          fill="currentColor"
        />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.presets {
  display: flex;
  gap: 0.3rem;
}

.preset {
  padding: 0.4rem 0.5rem;
  color: var(--text-dim);
}

.preset:hover {
  color: var(--text);
}

.preset.active {
  color: var(--accent);
  border-color: var(--accent);
  background: var(--accent-soft);
}
</style>
