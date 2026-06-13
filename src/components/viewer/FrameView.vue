<script setup lang="ts">
import { computed, inject, onUnmounted, shallowRef, watchEffect } from 'vue'
import type { FrameNode, NodePath } from '../../types'
import { panelContextKey } from '../../composables/panelContext'
import PanelUrlBar from './PanelUrlBar.vue'

const props = withDefaults(defineProps<{ frame: FrameNode; path?: NodePath }>(), {
  path: () => [],
})

// Cross-origin frames cannot be reloaded via contentWindow.location, so the
// auto-refresh option forces a remount by bumping the iframe :key.
const reloadTick = shallowRef(0)
let timer: ReturnType<typeof setInterval> | undefined

watchEffect(() => {
  clearInterval(timer)
  if (props.frame.refresh && props.frame.refresh > 0) {
    timer = setInterval(() => reloadTick.value++, props.frame.refresh * 1000)
  }
})

onUnmounted(() => clearInterval(timer))

// In a session, the presenter may propose a new URL for this panel; the
// spectator switches on demand instead of being reloaded automatically.
const panel = inject(panelContextKey, undefined)
const pathKey = computed(() => props.path.join('.'))
const pendingUrl = computed(() => panel?.pendingAt(pathKey.value))

function hostOf(url: string): string {
  try {
    return new URL(url).host
  } catch {
    return url
  }
}
</script>

<template>
  <div class="frame">
    <iframe
      :key="reloadTick"
      :src="frame.url"
      :title="frame.url"
      allow="fullscreen"
      referrerpolicy="no-referrer"
    />
    <PanelUrlBar
      v-if="panel?.isPresenter"
      :url="frame.url"
      @submit="panel.setUrl(pathKey, $event)"
    />
    <div v-else-if="pendingUrl" class="pending">
      <span class="label">Le présentateur affiche <strong>{{ hostOf(pendingUrl) }}</strong></span>
      <span class="actions">
        <button class="switch" @click="panel?.accept(pathKey)">Basculer</button>
        <button class="ignore" @click="panel?.dismiss(pathKey)">Ignorer</button>
      </span>
    </div>
  </div>
</template>

<style scoped>
.frame {
  position: relative;
  width: 100%;
  height: 100%;
}

.frame:hover :deep(.url-bar) {
  opacity: 1;
  pointer-events: auto;
}

iframe {
  border: 0;
  width: 100%;
  height: 100%;
  display: block;
  background: #fff;
}

.pending {
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  max-width: calc(100% - 16px);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.4rem 0.4rem 0.4rem 0.8rem;
  background: var(--bg-raised, #1a1d23);
  color: var(--text, #e6e6e6);
  border: 1px solid var(--border, #333);
  border-radius: var(--radius, 8px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.45);
  font-size: 0.85rem;
  z-index: 5;
}

.label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.actions {
  display: flex;
  gap: 0.3rem;
  flex-shrink: 0;
}

.pending button {
  padding: 0.3rem 0.6rem;
  font-size: 0.85rem;
}

.switch {
  color: var(--accent, #58a6ff);
  border-color: var(--accent, #58a6ff);
}

.ignore {
  opacity: 0.7;
}
</style>
