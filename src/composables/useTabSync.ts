import { onBeforeUnmount, shallowRef } from 'vue'
import { loadSyncPref, saveSyncPref } from '../lib/storage'

/**
 * Mirrors layout ratios across same-origin tabs showing the same shared URL.
 * The BroadcastChannel is keyed by the canonical share query, so only tabs
 * displaying the same layout talk to each other. A `null` payload means
 * "back to the original sizes" (reset).
 */
export function useTabSync(urlKey: string, onRemote: (ratios: Record<string, number> | null) => void) {
  const enabled = shallowRef(loadSyncPref())
  let channel: BroadcastChannel | null = null

  function open(): void {
    if (channel || typeof BroadcastChannel === 'undefined') return
    channel = new BroadcastChannel(`splitr:layout:${urlKey}`)
    channel.onmessage = (event: MessageEvent<Record<string, number> | null>) => {
      if (enabled.value) onRemote(event.data)
    }
  }

  function broadcast(ratios: Record<string, number> | null): void {
    if (enabled.value) channel?.postMessage(ratios)
  }

  function setEnabled(value: boolean): void {
    enabled.value = value
    saveSyncPref(value)
    if (value) open()
  }

  if (enabled.value) open()
  onBeforeUnmount(() => channel?.close())

  return { enabled, setEnabled, broadcast }
}
