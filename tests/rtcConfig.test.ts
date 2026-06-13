import { describe, expect, it } from 'vitest'
import { rtcConfigFromParams } from '../src/lib/rtcConfig'

const cfg = (search: string) => rtcConfigFromParams(new URLSearchParams(search))

describe('rtcConfigFromParams', () => {
  it('falls back to public defaults', () => {
    const config = cfg('')
    expect(config.signaling).toEqual(['wss://signaling.yjs.dev'])
    expect(config.iceServers).toEqual([{ urls: 'stun:stun.l.google.com:19302' }])
  })

  it('overrides signaling from ?signal= (comma-separated)', () => {
    const config = cfg('?signal=wss://a.example,wss://b.example')
    expect(config.signaling).toEqual(['wss://a.example', 'wss://b.example'])
  })

  it('overrides STUN from ?stun=', () => {
    const config = cfg('?stun=stun:one.example:3478,stun:two.example:3478')
    expect(config.iceServers).toEqual([
      { urls: 'stun:one.example:3478' },
      { urls: 'stun:two.example:3478' },
    ])
  })

  it('ignores empty values and trims', () => {
    const config = cfg('?signal=%20wss://a.example%20,,')
    expect(config.signaling).toEqual(['wss://a.example'])
  })
})
