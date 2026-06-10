import type { FrameNode, LayoutNode, NodePath, SplitNode } from '../types'
import { clampRatio, normalizeUrl } from './urlCodec'

export function makeFrame(url = ''): FrameNode {
  return { type: 'frame', url }
}

export function makeSplit(dir: 'h' | 'v', a: LayoutNode, b: LayoutNode, ratio = 50): SplitNode {
  return { type: 'split', dir, ratio, a, b }
}

export function defaultLayout(): SplitNode {
  return makeSplit('h', makeFrame(), makeFrame())
}

export function nodeAt(root: LayoutNode, path: NodePath): LayoutNode | null {
  let node: LayoutNode = root
  for (const branch of path) {
    if (node.type !== 'split') return null
    node = node[branch]
  }
  return node
}

/** Return a new tree with `path` replaced by `replacement` (root included). */
export function replaceAt(root: LayoutNode, path: NodePath, replacement: LayoutNode): LayoutNode {
  if (path.length === 0) return replacement
  if (root.type !== 'split') return root
  const [branch, ...rest] = path
  return { ...root, [branch]: replaceAt(root[branch], rest, replacement) }
}

/** Split the node at `path` in two; the existing node becomes side `a`. */
export function splitAt(root: LayoutNode, path: NodePath, dir: 'h' | 'v'): LayoutNode {
  const target = nodeAt(root, path)
  if (!target) return root
  const url = target.type === 'frame' ? target.url : ''
  return replaceAt(root, path, makeSplit(dir, target, makeFrame(url)))
}

/** Remove the node at `path`; its sibling takes the parent's place. */
export function removeAt(root: LayoutNode, path: NodePath): LayoutNode {
  if (path.length === 0) return root
  const parentPath = path.slice(0, -1)
  const branch = path[path.length - 1]
  const parent = nodeAt(root, parentPath)
  if (!parent || parent.type !== 'split') return root
  const sibling = parent[branch === 'a' ? 'b' : 'a']
  return replaceAt(root, parentPath, sibling)
}

export function updateFrameAt(
  root: LayoutNode,
  path: NodePath,
  patch: Partial<Omit<FrameNode, 'type'>>,
): LayoutNode {
  const target = nodeAt(root, path)
  if (!target || target.type !== 'frame') return root
  const updated: FrameNode = { ...target, ...patch }
  if (!updated.refresh || updated.refresh <= 0) delete updated.refresh
  return replaceAt(root, path, updated)
}

export function setRatioAt(root: LayoutNode, path: NodePath, ratio: number): LayoutNode {
  const target = nodeAt(root, path)
  if (!target || target.type !== 'split') return root
  return replaceAt(root, path, { ...target, ratio: clampRatio(ratio) })
}

/** Collect ratios as { "a.b": 60, ... } keyed by split path. */
export function collectRatios(root: LayoutNode, path: NodePath = []): Record<string, number> {
  if (root.type !== 'split') return {}
  return {
    [path.join('.')]: root.ratio,
    ...collectRatios(root.a, [...path, 'a']),
    ...collectRatios(root.b, [...path, 'b']),
  }
}

/** Apply ratio overrides produced by collectRatios(). */
export function applyRatios(root: LayoutNode, overrides: Record<string, number>): LayoutNode {
  if (root.type !== 'split') return root
  const apply = (node: LayoutNode, path: NodePath): LayoutNode => {
    if (node.type !== 'split') return node
    const key = path.join('.')
    const ratio = key in overrides ? clampRatio(overrides[key]) : node.ratio
    return {
      ...node,
      ratio,
      a: apply(node.a, [...path, 'a']),
      b: apply(node.b, [...path, 'b']),
    }
  }
  return apply(root, [])
}

/** Every frame in the tree, with its path (depth-first, left to right). */
export function listFrames(root: LayoutNode, path: NodePath = []): { frame: FrameNode; path: NodePath }[] {
  if (root.type === 'frame') return [{ frame: root, path }]
  return [...listFrames(root.a, [...path, 'a']), ...listFrames(root.b, [...path, 'b'])]
}

/** Rebuild the tree with every frame URL normalized; null if any is invalid. */
export function normalizeLayout(root: LayoutNode): LayoutNode | null {
  if (root.type === 'frame') {
    const url = normalizeUrl(root.url)
    return url ? { ...root, url } : null
  }
  const a = normalizeLayout(root.a)
  const b = normalizeLayout(root.b)
  return a && b ? { ...root, a, b } : null
}

/** A layout is openable when every frame has a non-empty URL. */
export function isComplete(root: LayoutNode): boolean {
  return listFrames(root).every(({ frame }) => frame.url.trim() !== '')
}
