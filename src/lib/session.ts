/**
 * Presenter-session identity, carried by the URL.
 *
 * - ?room=<slug>      joins a session (everyone who has the link).
 * - #key=<secret>     marks the presenter. The fragment is never sent over the
 *   network (not to the signaling server, not to peers), so the spectator link
 *   is simply the same URL without the fragment.
 *
 * The role is decided locally: a client is presenter iff its URL carries a key.
 * In plain P2P this is a cooperative contract (a modified client could still
 * write); a server of authority would be needed for a hard guarantee — out of
 * scope for v1.
 */

export interface SessionInfo {
  slug: string
  /** Present only for the presenter. */
  key: string | null
}

function randomToken(bytes: number): string {
  const buffer = new Uint8Array(bytes)
  crypto.getRandomValues(buffer)
  let binary = ''
  for (const byte of buffer) binary += String.fromCharCode(byte)
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '')
}

/** Room id shared in the spectator link (~16 chars). */
export function makeSlug(): string {
  return randomToken(12)
}

/** Presenter secret kept in the fragment (~22 chars). */
export function makeKey(): string {
  return randomToken(16)
}

/** BroadcastChannel/y-webrtc room name derived from the slug. */
export function roomChannel(slug: string): string {
  return `splitr-room-${slug}`
}

/** Parse the session from location.search + location.hash. Null when no room. */
export function parseSession(search: string, hash: string): SessionInfo | null {
  const slug = new URLSearchParams(search).get('room')?.trim()
  if (!slug) return null
  const key = new URLSearchParams(hash.replace(/^#/, '')).get('key')?.trim() || null
  return { slug, key }
}

/** Link a spectator opens: room only, no presenter key. */
export function spectatorLink(origin: string, pathname: string, slug: string): string {
  return `${origin}${pathname}?room=${encodeURIComponent(slug)}`
}

/** Link the presenter keeps: room + key in the fragment. */
export function presenterLink(origin: string, pathname: string, slug: string, key: string): string {
  return `${spectatorLink(origin, pathname, slug)}#key=${encodeURIComponent(key)}`
}
