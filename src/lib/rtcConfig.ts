/**
 * WebRTC infrastructure config for presenter sessions.
 *
 * Three distinct roles, not to be confused:
 * - Signaling: introduces peers at startup (this is what y-webrtc dials).
 * - STUN: lets each peer discover its public IP to punch through NAT.
 * - TURN: relays traffic when direct P2P fails (symmetric NAT, strict
 *   firewalls). None shipped in v1 — some peers behind such networks
 *   simply won't connect. Documented as a known limitation.
 *
 * v1 uses public best-effort servers. Everything is overridable from the URL
 * (?signal=, ?stun=, comma-separated) so a self-hosted setup later only needs
 * to change these defaults — no other code touches this.
 */

const DEFAULT_SIGNALING = ['wss://signaling.yjs.dev']
const DEFAULT_STUN = ['stun:stun.l.google.com:19302']

export interface RtcConfig {
  signaling: string[]
  iceServers: RTCIceServer[]
}

function csv(params: URLSearchParams, key: string): string[] | null {
  const raw = params.get(key)
  if (!raw) return null
  const values = raw
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
  return values.length > 0 ? values : null
}

export function rtcConfigFromParams(params: URLSearchParams): RtcConfig {
  const signaling = csv(params, 'signal') ?? DEFAULT_SIGNALING
  const stun = csv(params, 'stun') ?? DEFAULT_STUN
  return {
    signaling,
    iceServers: stun.map((urls) => ({ urls })),
  }
}
