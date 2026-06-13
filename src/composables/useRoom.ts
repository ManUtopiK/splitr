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
  /** True once at least one peer connection is established. */
  connected: Ref<boolean>
  /** True once a layout has been received from (or seeded into) the doc. */
  hasSharedLayout: Ref<boolean>
  doc: Y.Doc
  provider: WebrtcProvider
  setLayout: (layout: LayoutNode) => void
  setTitle: (title: string) => void
}

interface SessionState {
  layout?: LayoutNode
  title?: string
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
  const connected = ref(false)
  const hasSharedLayout = ref(false)

  function readFromDoc(): void {
    const sharedLayout = state.get('layout') as LayoutNode | undefined
    const sharedTitle = state.get('title') as string | undefined
    if (sharedLayout) {
      layout.value = sharedLayout
      hasSharedLayout.value = true
    }
    if (typeof sharedTitle === 'string') title.value = sharedTitle
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
    participants.value = provider.awareness.getStates().size || 1
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

  onBeforeUnmount(() => {
    provider.destroy()
    doc.destroy()
  })

  return {
    layout,
    title,
    isPresenter,
    participants,
    connected,
    hasSharedLayout,
    doc,
    provider,
    setLayout,
    setTitle,
  }
}
