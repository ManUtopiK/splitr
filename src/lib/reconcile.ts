import type { LayoutNode, NodePath } from '../types'

/**
 * Spectator-side reconciliation between the layout the presenter broadcasts
 * (`desired`) and the layout actually rendered (`displayed`).
 *
 * Structure and ratio changes apply immediately. URL changes do NOT: the old
 * page keeps rendering and the new URL is reported as "pending" so the panel
 * can offer a "switch" button — the spectator decides when to reload.
 *
 * Identity is by path: a frame whose URL changed but whose position is
 * unchanged stays mounted (only its pending banner appears), so accepting one
 * panel never reloads the others.
 */
export interface PendingUrl {
  /** Dotted split path of the frame, e.g. "a.b" (root frame = ""). */
  path: string
  url: string
}

export interface Reconciled {
  tree: LayoutNode
  pending: PendingUrl[]
}

export function reconcileLayout(
  displayed: LayoutNode,
  desired: LayoutNode,
  path: NodePath = [],
): Reconciled {
  // Same shape on both sides → reconcile in place.
  if (displayed.type === 'frame' && desired.type === 'frame') {
    const key = path.join('.')
    // First load (no real page yet) adopts silently — no banner.
    if (displayed.url && displayed.url !== desired.url) {
      return { tree: { ...desired, url: displayed.url }, pending: [{ path: key, url: desired.url }] }
    }
    return { tree: desired, pending: [] }
  }

  if (displayed.type === 'split' && desired.type === 'split') {
    const a = reconcileLayout(displayed.a, desired.a, [...path, 'a'])
    const b = reconcileLayout(displayed.b, desired.b, [...path, 'b'])
    return {
      tree: { ...desired, a: a.tree, b: b.tree },
      pending: [...a.pending, ...b.pending],
    }
  }

  // Structural change (frame <-> split): adopt the new layout wholesale.
  return { tree: desired, pending: [] }
}
