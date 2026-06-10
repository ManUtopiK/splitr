import { describe, expect, it } from 'vitest'
import {
  applyRatios,
  collectRatios,
  isComplete,
  makeFrame,
  makeSplit,
  nodeAt,
  normalizeLayout,
  removeAt,
  setRatioAt,
  splitAt,
  updateFrameAt,
} from '../src/lib/tree'
import type { SplitNode } from '../src/types'

const pair = (): SplitNode =>
  makeSplit('h', makeFrame('https://a.example/'), makeFrame('https://b.example/'))

describe('splitAt', () => {
  it('splits a frame, keeping its URL on both sides', () => {
    const root = splitAt(pair(), ['b'], 'v') as SplitNode
    const b = root.b as SplitNode
    expect(b.type).toBe('split')
    expect(b.dir).toBe('v')
    expect(b.a).toEqual(makeFrame('https://b.example/'))
    expect(b.b).toEqual(makeFrame('https://b.example/'))
  })

  it('does not mutate the original tree', () => {
    const original = pair()
    splitAt(original, ['a'], 'h')
    expect(original.a.type).toBe('frame')
  })
})

describe('removeAt', () => {
  it('promotes the sibling in place of the parent', () => {
    const root = removeAt(pair(), ['a'])
    expect(root).toEqual(makeFrame('https://b.example/'))
  })

  it('ignores removal of the root', () => {
    const root = pair()
    expect(removeAt(root, [])).toBe(root)
  })
})

describe('updateFrameAt / setRatioAt', () => {
  it('patches a frame and drops refresh <= 0', () => {
    let root = updateFrameAt(pair(), ['a'], { refresh: 30 })
    expect(nodeAt(root, ['a'])).toEqual({ type: 'frame', url: 'https://a.example/', refresh: 30 })
    root = updateFrameAt(root, ['a'], { refresh: 0 })
    expect(nodeAt(root, ['a'])).toEqual(makeFrame('https://a.example/'))
  })

  it('sets and clamps the ratio', () => {
    const root = setRatioAt(pair(), [], 99) as SplitNode
    expect(root.ratio).toBe(95)
  })
})

describe('ratios round-trip', () => {
  it('collectRatios + applyRatios restores sizes', () => {
    const root = makeSplit(
      'h',
      makeFrame('https://a.example/'),
      makeSplit('v', makeFrame('https://b.example/'), makeFrame('https://c.example/'), 70),
      30,
    )
    const ratios = collectRatios(root)
    expect(ratios).toEqual({ '': 30, b: 70 })

    const resized = applyRatios(pristine(root), { '': 60, b: 20 }) as SplitNode
    expect(resized.ratio).toBe(60)
    expect((resized.b as SplitNode).ratio).toBe(20)
  })
})

function pristine(node: SplitNode): SplitNode {
  return JSON.parse(JSON.stringify(node)) as SplitNode
}

describe('normalizeLayout / isComplete', () => {
  it('normalizes every frame URL', () => {
    const root = makeSplit('h', makeFrame('a.example'), makeFrame('b.example'))
    const normalized = normalizeLayout(root) as SplitNode
    expect(normalized.a).toEqual(makeFrame('https://a.example/'))
    expect(normalized.b).toEqual(makeFrame('https://b.example/'))
  })

  it('returns null when any URL is invalid', () => {
    expect(normalizeLayout(makeSplit('h', makeFrame(''), makeFrame('b.example')))).toBeNull()
  })

  it('isComplete requires every frame to have a URL', () => {
    expect(isComplete(pair())).toBe(true)
    expect(isComplete(makeSplit('h', makeFrame(), makeFrame('x.example')))).toBe(false)
  })
})
