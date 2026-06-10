import type { FrameNode, LayoutNode, SplitNode } from '../types'

/**
 * Layout <-> URL serialization.
 *
 * Two formats are supported:
 * - Simple:  ?a=<url>&b=<url>[&dir=h|v][&ratio=60]  — two frames, readable URL
 * - Generic: ?l=<base64url(compact JSON)>           — any tree, refresh options
 *
 * buildShareUrl() always emits the simplest form that can represent the layout.
 */

/** Compact JSON shape: frames {u, r?}, splits {d, t, a, b}. */
interface CompactFrame {
  u: string
  r?: number
}
interface CompactSplit {
  d: 'h' | 'v'
  t: number
  a: CompactNode
  b: CompactNode
}
type CompactNode = CompactFrame | CompactSplit

/** Accept only http(s) URLs; prepend https:// when the scheme is missing. */
export function normalizeUrl(raw: string): string | null {
  const trimmed = raw.trim()
  if (!trimmed) return null
  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
  try {
    const url = new URL(candidate)
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null
  } catch {
    return null
  }
}

export function clampRatio(ratio: number): number {
  if (!Number.isFinite(ratio)) return 50
  return Math.min(95, Math.max(5, Math.round(ratio * 10) / 10))
}

function toCompact(node: LayoutNode): CompactNode {
  if (node.type === 'frame') {
    const frame: CompactFrame = { u: node.url }
    if (node.refresh && node.refresh > 0) frame.r = node.refresh
    return frame
  }
  return { d: node.dir, t: node.ratio, a: toCompact(node.a), b: toCompact(node.b) }
}

function fromCompact(node: CompactNode): LayoutNode {
  if ('u' in node) {
    const frame: FrameNode = { type: 'frame', url: node.u }
    if (typeof node.r === 'number' && node.r > 0) frame.refresh = node.r
    return frame
  }
  return {
    type: 'split',
    dir: node.d === 'v' ? 'v' : 'h',
    ratio: clampRatio(node.t),
    a: fromCompact(node.a),
    b: fromCompact(node.b),
  }
}

function base64UrlEncode(text: string): string {
  const bytes = new TextEncoder().encode(text)
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '')
}

function base64UrlDecode(encoded: string): string {
  const base64 = encoded.replaceAll('-', '+').replaceAll('_', '/')
  const binary = atob(base64)
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

export function encodeLayout(layout: LayoutNode): string {
  return base64UrlEncode(JSON.stringify(toCompact(layout)))
}

export function decodeLayout(encoded: string): LayoutNode | null {
  try {
    return fromCompact(JSON.parse(base64UrlDecode(encoded)) as CompactNode)
  } catch {
    return null
  }
}

/** True when the layout is a plain two-frame split without refresh options. */
function asSimplePair(layout: LayoutNode): { a: FrameNode; b: FrameNode; split: SplitNode } | null {
  if (layout.type !== 'split') return null
  if (layout.a.type !== 'frame' || layout.b.type !== 'frame') return null
  if (layout.a.refresh || layout.b.refresh) return null
  return { a: layout.a, b: layout.b, split: layout }
}

/** Build the query string (without leading '?') for a layout. */
export function layoutToQuery(layout: LayoutNode): string {
  const pair = asSimplePair(layout)
  if (pair) {
    const params = new URLSearchParams()
    params.set('a', pair.a.url)
    params.set('b', pair.b.url)
    if (pair.split.dir !== 'h') params.set('dir', pair.split.dir)
    if (pair.split.ratio !== 50) params.set('ratio', String(pair.split.ratio))
    return params.toString()
  }
  return `l=${encodeLayout(layout)}`
}

/** Parse a layout from URL search params. Returns null when absent/invalid. */
export function layoutFromParams(params: URLSearchParams): LayoutNode | null {
  const encoded = params.get('l')
  if (encoded) return decodeLayout(encoded)

  const a = normalizeUrl(params.get('a') ?? '')
  const b = normalizeUrl(params.get('b') ?? '')
  if (!a || !b) return null

  const ratio = params.get('ratio')
  return {
    type: 'split',
    dir: params.get('dir') === 'v' ? 'v' : 'h',
    ratio: ratio ? clampRatio(Number(ratio)) : 50,
    a: { type: 'frame', url: a },
    b: { type: 'frame', url: b },
  }
}
