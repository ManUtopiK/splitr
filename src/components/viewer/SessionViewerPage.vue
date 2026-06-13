<script setup lang="ts">
import { computed, provide, ref, shallowRef, watch, watchEffect } from 'vue'
import { addPanelAt, listFrames, removeAt, setRatioAt, updateFrameAt } from '../../lib/tree'
import { normalizeUrl } from '../../lib/urlCodec'
import { pruneEmptyFrames, reconcileLayout } from '../../lib/reconcile'
import { spectatorLink, type SessionInfo } from '../../lib/session'
import { useRoom } from '../../composables/useRoom'
import { useSharedCursor } from '../../composables/useSharedCursor'
import { panelContextKey } from '../../composables/panelContext'
import type { LayoutNode, NodePath } from '../../types'
import FrameView from './FrameView.vue'
import SplitPane from './SplitPane.vue'
import SessionMenu from './SessionMenu.vue'
import RemoteCursor from './RemoteCursor.vue'

const props = defineProps<{
  session: SessionInfo
  initialLayout: LayoutNode | null
  initialTitle: string
}>()

// A spectator may join with just ?room= and no layout: render a placeholder
// until the presenter's layout arrives over the doc.
const placeholder: LayoutNode = { type: 'frame', url: '' }
const room = useRoom(props.session, props.initialLayout ?? placeholder, props.initialTitle)

const ready = computed(() => room.isPresenter || room.hasSharedLayout.value)

// Shared presenter cursor. "Pointer mode" lets the presenter point over iframes
// (an overlay captures the moves) at the cost of clicking through to them.
const cursor = useSharedCursor(room.provider, room.isPresenter)
const pointerMode = ref(false)
const viewerEl = ref<HTMLElement | null>(null)

function onPointerMove(event: PointerEvent): void {
  const host = viewerEl.value
  if (!host) return
  const rect = host.getBoundingClientRect()
  if (rect.width === 0 || rect.height === 0) return
  cursor.publish((event.clientX - rect.left) / rect.width, (event.clientY - rect.top) / rect.height)
}

// What is actually rendered. The presenter sees the shared layout live; a
// spectator keeps the currently-loaded URLs until they accept a switch.
const displayed = shallowRef<LayoutNode>(room.layout.value)
const pending = ref<Record<string, string>>({})
const dismissed: Record<string, string> = {}

function pathFromKey(key: string): NodePath {
  return key ? (key.split('.') as NodePath) : []
}

watch(
  room.layout,
  (desired) => {
    if (room.isPresenter) {
      displayed.value = desired
      return
    }
    // Hide panels the presenter just added but hasn't given a URL yet.
    const { tree, pending: list } = reconcileLayout(displayed.value, pruneEmptyFrames(desired))
    displayed.value = tree
    const next: Record<string, string> = {}
    for (const item of list) {
      if (dismissed[item.path] !== item.url) next[item.path] = item.url
    }
    pending.value = next
  },
  { immediate: true },
)

provide(panelContextKey, {
  isPresenter: room.isPresenter,
  setUrl: (key, url) => {
    if (!room.isPresenter) return
    const normalized = normalizeUrl(url)
    if (!normalized) return
    room.setLayout(updateFrameAt(room.layout.value, pathFromKey(key), { url: normalized }))
  },
  addPanel: (key, position) => {
    if (!room.isPresenter) return
    room.setLayout(addPanelAt(room.layout.value, pathFromKey(key), position))
  },
  removePanel: (key) => {
    if (!room.isPresenter || key === '') return
    room.setLayout(removeAt(room.layout.value, pathFromKey(key)))
  },
  pendingAt: (key) => pending.value[key],
  accept: (key) => {
    const url = pending.value[key]
    if (!url) return
    displayed.value = updateFrameAt(displayed.value, pathFromKey(key), { url })
    const rest = { ...pending.value }
    delete rest[key]
    pending.value = rest
    delete dismissed[key]
  },
  dismiss: (key) => {
    const url = pending.value[key]
    if (url) dismissed[key] = url
    const rest = { ...pending.value }
    delete rest[key]
    pending.value = rest
  },
})

watchEffect(() => {
  document.title =
    room.title.value.trim() ||
    listFrames(displayed.value)
      .map(({ frame }) => {
        try {
          return new URL(frame.url).host
        } catch {
          return frame.url
        }
      })
      .filter(Boolean)
      .join(' | ') ||
    'splitr session'
})

// Only the presenter resizes; the change propagates to spectators via the doc.
function onResize(path: NodePath, ratio: number): void {
  if (!room.isPresenter) return
  room.setLayout(setRatioAt(room.layout.value, path, ratio))
}

function copySpectatorLink(): void {
  const link = spectatorLink(window.location.origin, window.location.pathname, props.session.slug)
  void navigator.clipboard.writeText(link)
}

function leave(): void {
  window.location.href = window.location.pathname
}

function toggleFullscreen(): void {
  if (document.fullscreenElement) void document.exitFullscreen()
  else void document.documentElement.requestFullscreen()
}

function togglePointer(): void {
  pointerMode.value = !pointerMode.value
  if (!pointerMode.value) cursor.clear()
}
</script>

<template>
  <div ref="viewerEl" class="viewer">
    <template v-if="ready">
      <SplitPane
        v-if="displayed.type === 'split'"
        :node="displayed"
        :path="[]"
        :on-resize="onResize"
        :readonly="!room.isPresenter"
      />
      <FrameView v-else :frame="displayed" :path="[]" />
    </template>
    <div v-else class="connecting">
      <p>Connexion à la session…</p>
    </div>

    <!-- Presenter laser-pointer overlay: captures moves over iframes. -->
    <div
      v-if="room.isPresenter && pointerMode"
      class="pointer-overlay"
      @pointermove="onPointerMove"
      @pointerleave="cursor.clear()"
    />

    <!-- Spectators see the presenter's cursor. -->
    <RemoteCursor v-if="cursor.remote.value" :x="cursor.remote.value.x" :y="cursor.remote.value.y" />

    <SessionMenu
      :is-presenter="room.isPresenter"
      :participants="room.participants.value"
      :connected="room.connected.value"
      :pointer-mode="pointerMode"
      @copy-link="copySpectatorLink"
      @fullscreen="toggleFullscreen"
      @toggle-pointer="togglePointer"
      @leave="leave"
    />
  </div>
</template>

<style scoped>
.viewer {
  position: relative;
  height: 100%;
  display: flex;
}

.viewer > :deep(.split),
.viewer > :deep(.frame),
.viewer > .connecting {
  flex: 1;
  min-width: 0;
  min-height: 0;
}

.pointer-overlay {
  position: absolute;
  inset: 0;
  z-index: 7;
  cursor: crosshair;
}

.connecting {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted, #888);
  font-size: 0.95rem;
}
</style>
