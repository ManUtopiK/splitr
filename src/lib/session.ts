/**
 * Presenter-session identity.
 *
 * - ?room=<slug>      joins a session (everyone who has the link).
 * - presenter role    is held LOCALLY: the creator's key lives in localStorage
 *   (`splitr:presenter:<slug>`), not in the URL — so nothing sensitive shows in
 *   the address bar (safe to screen-share) and the URL can't leak control.
 * - #key=<secret>     is only an explicit co-presenter INVITE link. Opening it
 *   stores the key locally and the fragment is stripped from the URL.
 *
 * The role is a cooperative contract (a modified client could still write); a
 * server of authority would be needed for a hard guarantee — out of scope.
 */

export interface SessionInfo {
  slug: string
  /** The presenter key (non-null ⇒ this client is the presenter). */
  key: string | null
}

const PRESENTER_PREFIX = 'splitr:presenter:'

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

/** Presenter secret kept in localStorage (~22 chars). */
export function makeKey(): string {
  return randomToken(16)
}

/** BroadcastChannel/y-webrtc room name derived from the slug. */
export function roomChannel(slug: string): string {
  return `splitr-room-${slug}`
}

/** Pure parse of the room slug + an optional invite key. Null when no room. */
export function parseRoom(
  search: string,
  hash: string,
): { slug: string; inviteKey: string | null } | null {
  const slug = new URLSearchParams(search).get('room')?.trim()
  if (!slug) return null
  const inviteKey = new URLSearchParams(hash.replace(/^#/, '')).get('key')?.trim() || null
  return { slug, inviteKey }
}

/** Remember that this browser is the presenter for a room. */
export function rememberPresenter(slug: string, key: string): void {
  try {
    localStorage.setItem(PRESENTER_PREFIX + slug, key)
  } catch {
    // Storage disabled — the role just won't survive a reload.
  }
}

function recallPresenter(slug: string): string | null {
  try {
    return localStorage.getItem(PRESENTER_PREFIX + slug)
  } catch {
    return null
  }
}

/**
 * Resolve the session at load (reads the URL, localStorage and may rewrite the
 * URL). An invite key in the fragment is adopted: stored locally, then removed
 * from the address bar. Otherwise the presenter key comes from localStorage.
 */
export function resolveSession(): SessionInfo | null {
  const parsed = parseRoom(window.location.search, window.location.hash)
  if (!parsed) return null
  const { slug, inviteKey } = parsed
  if (inviteKey) {
    rememberPresenter(slug, inviteKey)
    try {
      history.replaceState(null, '', window.location.pathname + window.location.search)
    } catch {
      // ignore — keeping the fragment is harmless, just less tidy.
    }
    return { slug, key: inviteKey }
  }
  return { slug, key: recallPresenter(slug) }
}

/** Link a spectator opens: room only, no key. */
export function spectatorLink(origin: string, pathname: string, slug: string): string {
  return `${origin}${pathname}?room=${encodeURIComponent(slug)}`
}

/** Invite link that grants presenter control to a co-presenter (carries the key). */
export function coPresenterLink(
  origin: string,
  pathname: string,
  slug: string,
  key: string,
): string {
  return `${spectatorLink(origin, pathname, slug)}#key=${encodeURIComponent(key)}`
}
