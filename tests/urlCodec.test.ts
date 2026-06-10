import { describe, expect, it } from 'vitest'
import {
  clampRatio,
  decodeLayout,
  encodeLayout,
  layoutFromParams,
  layoutToQuery,
  normalizeUrl,
} from '../src/lib/urlCodec'
import type { LayoutNode, SplitNode } from '../src/types'

const frame = (url: string, refresh?: number): LayoutNode =>
  refresh ? { type: 'frame', url, refresh } : { type: 'frame', url }

const split = (
  dir: 'h' | 'v',
  ratio: number,
  a: LayoutNode,
  b: LayoutNode,
): SplitNode => ({ type: 'split', dir, ratio, a, b })

describe('normalizeUrl', () => {
  it('accepts http(s) URLs', () => {
    expect(normalizeUrl('https://example.com/x?y=1')).toBe('https://example.com/x?y=1')
    expect(normalizeUrl('http://example.com')).toBe('http://example.com/')
  })

  it('prepends https:// when the scheme is missing', () => {
    expect(normalizeUrl('example.com')).toBe('https://example.com/')
  })

  it('rejects empty and non-http schemes', () => {
    expect(normalizeUrl('')).toBeNull()
    expect(normalizeUrl('   ')).toBeNull()
    expect(normalizeUrl('javascript:alert(1)')).toBeNull()
  })
})

describe('clampRatio', () => {
  it('clamps into [5, 95] and defaults to 50', () => {
    expect(clampRatio(2)).toBe(5)
    expect(clampRatio(99)).toBe(95)
    expect(clampRatio(60)).toBe(60)
    expect(clampRatio(Number.NaN)).toBe(50)
  })
})

describe('encode/decode layout', () => {
  it('round-trips an arbitrary tree', () => {
    const layout = split(
      'h',
      30,
      frame('https://a.example/'),
      split('v', 66, frame('https://b.example/', 30), frame('https://c.example/')),
    )
    expect(decodeLayout(encodeLayout(layout))).toEqual(layout)
  })

  it('returns null on garbage', () => {
    expect(decodeLayout('not-base64!!')).toBeNull()
    expect(decodeLayout('')).toBeNull()
  })
})

describe('layoutToQuery', () => {
  it('uses readable a/b params for a simple pair', () => {
    const layout = split('h', 50, frame('https://a.example/'), frame('https://b.example/'))
    const params = new URLSearchParams(layoutToQuery(layout))
    expect(params.get('a')).toBe('https://a.example/')
    expect(params.get('b')).toBe('https://b.example/')
    expect(params.get('dir')).toBeNull()
    expect(params.get('ratio')).toBeNull()
    expect(params.get('l')).toBeNull()
  })

  it('keeps dir and ratio when non-default', () => {
    const layout = split('v', 70, frame('https://a.example/'), frame('https://b.example/'))
    const params = new URLSearchParams(layoutToQuery(layout))
    expect(params.get('dir')).toBe('v')
    expect(params.get('ratio')).toBe('70')
  })

  it('falls back to ?l= for nested layouts or refresh options', () => {
    const nested = split(
      'h',
      50,
      frame('https://a.example/'),
      split('v', 50, frame('https://b.example/'), frame('https://c.example/')),
    )
    expect(layoutToQuery(nested)).toMatch(/^l=/)

    const withRefresh = split('h', 50, frame('https://a.example/', 60), frame('https://b.example/'))
    expect(layoutToQuery(withRefresh)).toMatch(/^l=/)
  })
})

describe('layoutFromParams', () => {
  it('parses simple a/b params with defaults', () => {
    const layout = layoutFromParams(new URLSearchParams('a=https://a.example/&b=b.example'))
    expect(layout).toEqual(
      split('h', 50, frame('https://a.example/'), frame('https://b.example/')),
    )
  })

  it('parses dir and ratio', () => {
    const layout = layoutFromParams(
      new URLSearchParams('a=https://a.example/&b=https://b.example/&dir=v&ratio=70'),
    ) as SplitNode
    expect(layout.dir).toBe('v')
    expect(layout.ratio).toBe(70)
  })

  it('returns null when a param is missing or invalid', () => {
    expect(layoutFromParams(new URLSearchParams('a=https://a.example/'))).toBeNull()
    expect(
      layoutFromParams(new URLSearchParams('a=javascript:alert(1)&b=https://b.example/')),
    ).toBeNull()
    expect(layoutFromParams(new URLSearchParams(''))).toBeNull()
  })

  it('round-trips through layoutToQuery', () => {
    const layout = split(
      'v',
      25,
      frame('https://a.example/'),
      split('h', 60, frame('https://b.example/', 10), frame('https://c.example/')),
    )
    const query = layoutToQuery(layout)
    expect(layoutFromParams(new URLSearchParams(query))).toEqual(layout)
  })
})
