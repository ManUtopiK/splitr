import { describe, expect, it } from 'vitest'
import { IFRAME_ALLOW } from '../src/lib/iframe'

describe('IFRAME_ALLOW', () => {
  const directives = IFRAME_ALLOW.split(';').map((d) => d.trim())

  it('delegates camera and microphone to any origin', () => {
    expect(directives).toContain('camera *')
    expect(directives).toContain('microphone *')
  })

  it('keeps fullscreen and screen sharing', () => {
    expect(directives).toContain('fullscreen')
    expect(directives).toContain('display-capture *')
  })
})
