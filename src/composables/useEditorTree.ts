import type { InjectionKey, ShallowRef } from 'vue'
import { inject, provide, shallowRef } from 'vue'
import {
  defaultLayout,
  nodeAt,
  removeAt,
  setRatioAt,
  splitAt,
  updateFrameAt,
} from '../lib/tree'
import type { FrameNode, LayoutNode, NodePath } from '../types'

/**
 * Editor state shared with the recursive PaneEditor tree via provide/inject
 * (event bubbling through arbitrary depth would be unwieldy). The tree is
 * immutable: every operation replaces the root, keeping updates predictable.
 */
export interface EditorTree {
  layout: ShallowRef<LayoutNode>
  /** Optional page title shared via the ?t= URL param. */
  title: ShallowRef<string>
  splitPane: (path: NodePath, dir: 'h' | 'v') => void
  removePane: (path: NodePath) => void
  updateFrame: (path: NodePath, patch: Partial<Omit<FrameNode, 'type'>>) => void
  /** Percentage of the parent split granted to the node at `path`. */
  getShare: (path: NodePath) => number | null
  setShare: (path: NodePath, pct: number) => void
  /** Set the ratio of the split node at `path` directly (drag handles). */
  setRatio: (path: NodePath, ratio: number) => void
  setLayout: (layout: LayoutNode) => void
}

const KEY: InjectionKey<EditorTree> = Symbol('editor-tree')

export function provideEditorTree(initial: LayoutNode | null, initialTitle = ''): EditorTree {
  const layout = shallowRef<LayoutNode>(initial ?? defaultLayout())
  const title = shallowRef(initialTitle)

  const getShare = (path: NodePath): number | null => {
    if (path.length === 0) return null
    const parent = nodeAt(layout.value, path.slice(0, -1))
    if (!parent || parent.type !== 'split') return null
    const branch = path[path.length - 1]
    return branch === 'a' ? parent.ratio : 100 - parent.ratio
  }

  const tree: EditorTree = {
    layout,
    title,
    splitPane: (path, dir) => {
      layout.value = splitAt(layout.value, path, dir)
    },
    removePane: (path) => {
      layout.value = removeAt(layout.value, path)
    },
    updateFrame: (path, patch) => {
      layout.value = updateFrameAt(layout.value, path, patch)
    },
    getShare,
    setShare: (path, pct) => {
      if (path.length === 0) return
      const branch = path[path.length - 1]
      const ratio = branch === 'a' ? pct : 100 - pct
      layout.value = setRatioAt(layout.value, path.slice(0, -1), ratio)
    },
    setRatio: (path, ratio) => {
      layout.value = setRatioAt(layout.value, path, ratio)
    },
    setLayout: (next) => {
      layout.value = next
    },
  }

  provide(KEY, tree)
  return tree
}

export function useEditorTree(): EditorTree {
  const tree = inject(KEY)
  if (!tree) throw new Error('useEditorTree() called outside the editor')
  return tree
}
