import type { LayoutNode, SavedConfig } from '../types'

/**
 * localStorage persistence:
 * - splitr:configs        — named configurations (editor)
 * - splitr:sizes:<query>  — per-URL ratio overrides set by end-user resizing,
 *   keyed by the full share query so each shared URL remembers its own sizes.
 * - splitr:syncTabs       — viewer option: mirror layout across tabs (BroadcastChannel)
 */

const CONFIGS_KEY = 'splitr:configs'
const SIZES_PREFIX = 'splitr:sizes:'
const SYNC_KEY = 'splitr:syncTabs'

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Quota exceeded or storage disabled — persistence is best-effort.
  }
}

export function loadConfigs(): SavedConfig[] {
  return read<SavedConfig[]>(CONFIGS_KEY) ?? []
}

export function saveConfig(name: string, layout: LayoutNode, title?: string): SavedConfig[] {
  const configs = loadConfigs().filter((config) => config.name !== name)
  const entry: SavedConfig = { name, layout, savedAt: Date.now() }
  if (title?.trim()) entry.title = title.trim()
  configs.unshift(entry)
  write(CONFIGS_KEY, configs)
  return configs
}

export function deleteConfig(name: string): SavedConfig[] {
  const configs = loadConfigs().filter((config) => config.name !== name)
  write(CONFIGS_KEY, configs)
  return configs
}

export function loadSizes(urlKey: string): Record<string, number> | null {
  return read<Record<string, number>>(SIZES_PREFIX + urlKey)
}

export function saveSizes(urlKey: string, ratios: Record<string, number>): void {
  write(SIZES_PREFIX + urlKey, ratios)
}

export function clearSizes(urlKey: string): void {
  try {
    localStorage.removeItem(SIZES_PREFIX + urlKey)
  } catch {
    // ignore
  }
}

export function loadSyncPref(): boolean {
  return read<boolean>(SYNC_KEY) ?? false
}

export function saveSyncPref(enabled: boolean): void {
  write(SYNC_KEY, enabled)
}
