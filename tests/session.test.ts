import { describe, expect, it } from 'vitest'
import { coPresenterLink, parseRoom, roomChannel, spectatorLink } from '../src/lib/session'

describe('parseRoom', () => {
  it('returns null without a room', () => {
    expect(parseRoom('', '')).toBeNull()
    expect(parseRoom('?a=https://x.example', '')).toBeNull()
  })

  it('parses a room with no invite key', () => {
    expect(parseRoom('?room=abc123', '')).toEqual({ slug: 'abc123', inviteKey: null })
  })

  it('parses a co-presenter invite key from the fragment', () => {
    expect(parseRoom('?room=abc123', '#key=s3cret')).toEqual({
      slug: 'abc123',
      inviteKey: 's3cret',
    })
  })

  it('ignores an empty key', () => {
    expect(parseRoom('?room=abc123', '#key=')).toEqual({ slug: 'abc123', inviteKey: null })
  })

  it('keeps the room even with other params and fragments', () => {
    expect(parseRoom('?l=xyz&room=r1&t=Demo', '#key=k1')).toEqual({
      slug: 'r1',
      inviteKey: 'k1',
    })
  })
})

describe('link builders', () => {
  it('spectator link omits the fragment', () => {
    expect(spectatorLink('https://splitr.app', '/', 'r1')).toBe('https://splitr.app/?room=r1')
  })

  it('co-presenter link carries the key in the fragment', () => {
    expect(coPresenterLink('https://splitr.app', '/', 'r1', 'k1')).toBe(
      'https://splitr.app/?room=r1#key=k1',
    )
  })

  it('round-trips through parseRoom', () => {
    const link = coPresenterLink('https://splitr.app', '/', 'room42', 'secret9')
    const url = new URL(link)
    expect(parseRoom(url.search, url.hash)).toEqual({ slug: 'room42', inviteKey: 'secret9' })
  })
})

describe('roomChannel', () => {
  it('namespaces the slug', () => {
    expect(roomChannel('abc')).toBe('splitr-room-abc')
  })
})
