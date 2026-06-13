import { onBeforeUnmount, shallowRef, type ShallowRef } from 'vue'
import type { WebrtcProvider } from 'y-webrtc'

/**
 * Presenter cursor shared over Yjs awareness.
 *
 * Position is normalized to the viewer container [0..1] on both axes. Because
 * split ratios are synced through the doc, panel boundaries line up across
 * clients regardless of window size, so a container-relative position lands in
 * the same panel for every spectator.
 *
 * Presenter publishes (throttled to one frame); spectators expose the latest
 * presenter position, auto-cleared after a short idle.
 */
export interface RemoteCursor {
  x: number
  y: number
}

const IDLE_MS = 3000

export function useSharedCursor(
  provider: WebrtcProvider,
  isPresenter: boolean,
): {
  remote: ShallowRef<RemoteCursor | null>
  publish: (x: number, y: number) => void
  clear: () => void
} {
  const awareness = provider.awareness
  const remote = shallowRef<RemoteCursor | null>(null)

  // --- Presenter: publish, coalesced to one update per animation frame. ---
  let pending: RemoteCursor | null = null
  let frame: number | undefined

  function flush(): void {
    frame = undefined
    if (pending) awareness.setLocalStateField('cursor', { ...pending, t: performance.now() })
  }

  function publish(x: number, y: number): void {
    pending = { x, y }
    if (frame === undefined) frame = requestAnimationFrame(flush)
  }

  function clear(): void {
    pending = null
    if (frame !== undefined) {
      cancelAnimationFrame(frame)
      frame = undefined
    }
    awareness.setLocalStateField('cursor', null)
  }

  // --- Spectator: track the presenter's cursor, drop it after idle. ---
  let idleTimer: ReturnType<typeof setTimeout> | undefined

  function readRemote(): void {
    if (isPresenter) return
    let found: RemoteCursor | null = null
    for (const state of awareness.getStates().values()) {
      if (state.role === 'presenter' && state.cursor) {
        found = { x: state.cursor.x, y: state.cursor.y }
        break
      }
    }
    remote.value = found
    clearTimeout(idleTimer)
    if (found) idleTimer = setTimeout(() => (remote.value = null), IDLE_MS)
  }

  if (!isPresenter) awareness.on('change', readRemote)

  onBeforeUnmount(() => {
    if (frame !== undefined) cancelAnimationFrame(frame)
    clearTimeout(idleTimer)
    if (!isPresenter) awareness.off('change', readRemote)
  })

  return { remote, publish, clear }
}
