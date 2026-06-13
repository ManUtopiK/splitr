import type { InjectionKey } from 'vue'
import type { AddPosition } from '../lib/tree'

/**
 * Lets a deeply-nested FrameView surface a "switch to the URL the presenter
 * chose" banner without threading props through every SplitPane. Provided only
 * by SessionViewerPage for spectators; absent elsewhere, so FrameView shows no
 * banner outside a session.
 */
export interface PanelContext {
  /** This client drives the session (shows the per-panel URL editor). */
  isPresenter: boolean
  /** Pending URL for the frame at this dotted path, or undefined (spectator). */
  pendingAt: (pathKey: string) => string | undefined
  /** Apply the pending URL (reloads only this panel). */
  accept: (pathKey: string) => void
  /** Dismiss the banner, keeping the current page. */
  dismiss: (pathKey: string) => void
  /** Presenter: replace this panel's URL, broadcasting to spectators. */
  setUrl: (pathKey: string, url: string) => void
  /** Presenter: add an empty panel next to this one. */
  addPanel: (pathKey: string, position: AddPosition) => void
  /** Presenter: remove this panel (its sibling takes its place). */
  removePanel: (pathKey: string) => void
}

export const panelContextKey: InjectionKey<PanelContext> = Symbol('splitr-panel-context')
