import { onBeforeUnmount, ref, shallowRef, type Ref, type ShallowRef } from 'vue'
import * as Y from 'yjs'
import { WebrtcProvider } from 'y-webrtc'
import type { LayoutNode } from '../types'
import { rtcConfigFromParams } from '../lib/rtcConfig'
import { roomChannel, type SessionInfo } from '../lib/session'

/**
 * Live presenter session over a shared Yjs document (y-webrtc transport).
 *
 * The whole layout is stored as one opaque JSON value in a Y.Map: only the
 * presenter writes, so we don't need per-node CRDT granularity — a wholesale
 * replace on each change is enough, and spectators observe and reflect it.
 *
 * Awareness carries presence (participant count, presenter role) and, later,
 * the presenter cursor.
 */
export interface RoomSession {
  /** Shared layout, reactive. Presenter writes via setLayout(); spectators read. */
  layout: ShallowRef<LayoutNode>
  title: Ref<string>
  /** True when this client holds the presenter key. */
  isPresenter: boolean
  /** Connected participant count (self included). */
  participants: Ref<number>
  /** Connected participants with their name/role (for the presenter's list). */
  peers: Ref<{ name: string; role: string }[]>
  /** True once at least one peer connection is established. */
  connected: Ref<boolean>
  /** True once a layout has been received from (or seeded into) the doc. */
  hasSharedLayout: Ref<boolean>
  /** Optional scheduled start (epoch ms); spectators see a countdown until then. */
  startAt: Ref<number | null>
  /** When true, spectators must enter a name before seeing the layout. */
  requireName: Ref<boolean>
  doc: Y.Doc
  provider: WebrtcProvider
  setLayout: (layout: LayoutNode) => void
  setTitle: (title: string) => void
  setStartAt: (ts: number | null) => void
  setRequireName: (value: boolean) => void
  setName: (name: string) => void
}

interface SessionState {
  layout?: LayoutNode
  title?: string
  startAt?: number
  requireName?: boolean
}

export function useRoom(
  session: SessionInfo,
  initialLayout: LayoutNode,
  initialTitle: string,
): RoomSession {
  const isPresenter = session.key !== null
  const doc = new Y.Doc()
  const config = rtcConfigFromParams(new URLSearchParams(window.location.search))
  const provider = new WebrtcProvider(roomChannel(session.slug), doc, {
    signaling: config.signaling,
    peerOpts: { config: { iceServers: config.iceServers } },
  })

  const state = doc.getMap<SessionState[keyof SessionState]>('session')
  const layout = shallowRef<LayoutNode>(initialLayout)
  const title = ref(initialTitle)
  const participants = ref(1)
  const peers = ref<{ name: string; role: string }[]>([])
  const connected = ref(false)
  const hasSharedLayout = ref(false)
  const startAt = ref<number | null>(null)
  const requireName = ref(false)

  function readFromDoc(): void {
    const sharedLayout = state.get('layout') as LayoutNode | undefined
    const sharedTitle = state.get('title') as string | undefined
    if (sharedLayout) {
      layout.value = sharedLayout
      hasSharedLayout.value = true
    }
    if (typeof sharedTitle === 'string') title.value = sharedTitle
    const sharedStart = state.get('startAt')
    startAt.value = typeof sharedStart === 'number' ? sharedStart : null
    requireName.value = state.get('requireName') === true
  }

  state.observe(readFromDoc)
  // Adopt whatever already synced before we attached the observer.
  readFromDoc()

  // The presenter is the source of truth: seed the shared doc from the URL
  // layout when the room has none yet (fresh session, or solo reload).
  if (isPresenter) {
    const seed = (): void => {
      if (state.get('layout') === undefined) {
        doc.transact(() => {
          state.set('layout', initialLayout)
          if (initialTitle.trim()) state.set('title', initialTitle)
        })
      }
    }
    seed()
    provider.on('synced', seed)
  }

  function updatePresence(): void {
    const states = [...provider.awareness.getStates().values()]
    participants.value = states.length || 1
    peers.value = states.map((s) => ({
      name: typeof s.name === 'string' ? s.name : '',
      role: typeof s.role === 'string' ? s.role : 'spectator',
    }))
  }
  provider.awareness.setLocalStateField('role', isPresenter ? 'presenter' : 'spectator')
  provider.awareness.on('change', updatePresence)
  updatePresence()

  provider.on('peers', (event: { webrtcPeers: string[]; bcPeers: string[] }) => {
    connected.value = event.webrtcPeers.length > 0 || event.bcPeers.length > 0
  })

  function setLayout(next: LayoutNode): void {
    if (!isPresenter) return
    layout.value = next
    doc.transact(() => state.set('layout', next))
  }

  function setTitle(next: string): void {
    if (!isPresenter) return
    title.value = next
    doc.transact(() => state.set('title', next))
  }

  function setStartAt(ts: number | null): void {
    if (!isPresenter) return
    startAt.value = ts
    doc.transact(() => {
      if (ts === null) state.delete('startAt')
      else state.set('startAt', ts)
    })
  }

  function setRequireName(value: boolean): void {
    if (!isPresenter) return
    requireName.value = value
    doc.transact(() => state.set('requireName', value))
  }

  function setName(name: string): void {
    provider.awareness.setLocalStateField('name', name)
  }

  onBeforeUnmount(() => {
    provider.destroy()
    doc.destroy()
  })

  return {
    layout,
    title,
    isPresenter,
    participants,
    peers,
    connected,
    hasSharedLayout,
    startAt,
    requireName,
    doc,
    provider,
    setLayout,
    setTitle,
    setStartAt,
    setRequireName,
    setName,
  }
}
