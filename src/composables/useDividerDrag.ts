import type { ShallowRef } from 'vue'
import { clampRatio } from '../lib/urlCodec'

/**
 * Pointer-drag logic for a split divider: converts pointer position into a
 * ratio (%) of the container along the split direction. Pointer capture is
 * best-effort; a local flag drives the drag so synthetic events also work.
 * Used by both the viewer (SplitPane) and the editor (PaneEditor).
 */
export function useDividerDrag(options: {
  container: Readonly<ShallowRef<HTMLElement | null>>
  dir: () => 'h' | 'v'
  onRatio: (ratio: number) => void
}) {
  let dragging = false

  function onPointerDown(event: PointerEvent): void {
    dragging = true
    try {
      ;(event.target as HTMLElement).setPointerCapture(event.pointerId)
    } catch {
      // Capture is best-effort; the dragging flag drives the resize.
    }
    // Iframes swallow pointer events: disable them globally while dragging.
    document.body.classList.add('splitr-dragging')
  }

  function onPointerMove(event: PointerEvent): void {
    if (!dragging) return
    const rect = options.container.value?.getBoundingClientRect()
    if (!rect) return
    const ratio =
      options.dir() === 'h'
        ? ((event.clientX - rect.left) / rect.width) * 100
        : ((event.clientY - rect.top) / rect.height) * 100
    options.onRatio(clampRatio(ratio))
  }

  function onPointerUp(event: PointerEvent): void {
    dragging = false
    try {
      ;(event.target as HTMLElement).releasePointerCapture(event.pointerId)
    } catch {
      // ignore
    }
    document.body.classList.remove('splitr-dragging')
  }

  return { onPointerDown, onPointerMove, onPointerUp }
}
