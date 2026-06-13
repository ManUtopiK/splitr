import { describe, expect, it } from 'vitest'
import {
  parseSession,
  presenterLink,
  roomChannel,
  spectatorLink,
} from '../src/lib/session'

describe('parseSession', () => {
  it('returns null without a room', () => {
    expect(parseSession('', '')).toBeNull()
    expect(parseSession('?a=https://x.example', '')).toBeNull()
  })

  it('parses a spectator session (room, no key)', () => {
    expect(parseSession('?room=abc123', '')).toEqual({ slug: 'abc123', key: null })
  })

  it('parses a presenter session (room + key in the fragment)', () => {
    expect(parseSession('?room=abc123', '#key=s3cret')).toEqual({
      slug: 'abc123',
      key: 's3cret',
    })
  })

  it('ignores an empty key', () => {
    expect(parseSession('?room=abc123', '#key=')).toEqual({ slug: 'abc123', key: null })
  })

  it('keeps the room even with other params and fragments', () => {
    expect(parseSession('?l=xyz&room=r1&t=Demo', '#key=k1')).toEqual({
      slug: 'r1',
      key: 'k1',
    })
  })
})

describe('link builders', () => {
  it('spectator link omits the fragment', () => {
    expect(spectatorLink('https://splitr.app', '/', 'r1')).toBe('https://splitr.app/?room=r1')
  })

  it('presenter link carries the key in the fragment', () => {
    expect(presenterLink('https://splitr.app', '/', 'r1', 'k1')).toBe(
      'https://splitr.app/?room=r1#key=k1',
    )
  })

  it('round-trips through parseSession', () => {
    const link = presenterLink('https://splitr.app', '/', 'room42', 'secret9')
    const url = new URL(link)
    expect(parseSession(url.search, url.hash)).toEqual({ slug: 'room42', key: 'secret9' })
  })
})

describe('roomChannel', () => {
  it('namespaces the slug', () => {
    expect(roomChannel('abc')).toBe('splitr-room-abc')
  })
})
