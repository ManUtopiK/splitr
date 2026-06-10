/** A single iframe panel. */
export interface FrameNode {
  type: 'frame'
  url: string
  /** Auto-reload interval in seconds (0 or undefined = disabled). */
  refresh?: number
}

/**
 * A binary split. `dir: 'h'` lays children side by side (horizontal split),
 * `dir: 'v'` stacks them (vertical split). `ratio` is the percentage of the
 * available space given to `a` (0-100).
 */
export interface SplitNode {
  type: 'split'
  dir: 'h' | 'v'
  ratio: number
  a: LayoutNode
  b: LayoutNode
}

export type LayoutNode = FrameNode | SplitNode

/**
 * Path of a node inside the tree: sequence of 'a'/'b' branches from the root.
 * The root path is the empty array.
 */
export type NodePath = ('a' | 'b')[]

/** A named configuration saved in localStorage. */
export interface SavedConfig {
  name: string
  layout: LayoutNode
  savedAt: number
}
