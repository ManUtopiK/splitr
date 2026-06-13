import { describe, expect, it } from 'vitest'
import { reconcileLayout } from '../src/lib/reconcile'
import type { LayoutNode, SplitNode } from '../src/types'

const frame = (url: string): LayoutNode => ({ type: 'frame', url })
const split = (a: LayoutNode, b: LayoutNode, ratio = 50): SplitNode => ({
  type: 'split',
  dir: 'h',
  ratio,
  a,
  b,
})

describe('reconcileLayout', () => {
  it('adopts the desired layout when nothing changed', () => {
    const tree = split(frame('https://a'), frame('https://b'))
    const { tree: out, pending } = reconcileLayout(tree, tree)
    expect(pending).toEqual([])
    expect(out).toEqual(tree)
  })

  it('keeps the old URL and reports a pending change for a single panel', () => {
    const displayed = split(frame('https://a'), frame('https://b'))
    const desired = split(frame('https://a'), frame('https://NEW'))
    const { tree, pending } = reconcileLayout(displayed, desired)
    expect(pending).toEqual([{ path: 'b', url: 'https://NEW' }])
    // Panel b still renders the old URL; panel a is untouched.
    expect((tree as SplitNode).b).toEqual(frame('https://b'))
    expect((tree as SplitNode).a).toEqual(frame('https://a'))
  })

  it('reports pending changes per panel independently', () => {
    const displayed = split(frame('https://a'), frame('https://b'))
    const desired = split(frame('https://A2'), frame('https://B2'))
    const { pending } = reconcileLayout(displayed, desired)
    expect(pending).toEqual([
      { path: 'a', url: 'https://A2' },
      { path: 'b', url: 'https://B2' },
    ])
  })

  it('applies ratio changes immediately (no pending)', () => {
    const displayed = split(frame('https://a'), frame('https://b'), 50)
    const desired = split(frame('https://a'), frame('https://b'), 70)
    const { tree, pending } = reconcileLayout(displayed, desired)
    expect(pending).toEqual([])
    expect((tree as SplitNode).ratio).toBe(70)
  })

  it('adopts structural changes wholesale (no pending)', () => {
    const displayed = frame('https://a')
    const desired = split(frame('https://a'), frame('https://b'))
    const { tree, pending } = reconcileLayout(displayed, desired)
    expect(pending).toEqual([])
    expect(tree).toEqual(desired)
  })

  it('loads silently into an empty panel (first paint, no banner)', () => {
    const displayed = frame('')
    const desired = frame('https://a')
    const { tree, pending } = reconcileLayout(displayed, desired)
    expect(pending).toEqual([])
    expect(tree).toEqual(desired)
  })

  it('uses dotted paths for nested panels', () => {
    const displayed = split(frame('https://a'), split(frame('https://b'), frame('https://c')))
    const desired = split(frame('https://a'), split(frame('https://b'), frame('https://C2')))
    const { pending } = reconcileLayout(displayed, desired)
    expect(pending).toEqual([{ path: 'b.b', url: 'https://C2' }])
  })
})
