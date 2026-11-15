/**
 * Web fallback for standalone browser preview / testing.
 * When running outside Electron (where preload is not injected), provides safe stubs
 * so the React shell, theme engine, and MAXX IA interface mount and render in any modern browser.
 */

import { applyPrefsToDocument, $prefs } from '../store/backend.ts'
import { $themes } from '../store/themes.ts'

export const BUILTIN_THEMES = [
  {
    name: 'herald-ocean',
    label: 'MAXX Ocean',
    description: 'Deep royal blue with an electric blue accent.',
    scheme: 'dark' as const,
    source: 'builtin' as const,
    colors: {
      bg: '#04113f',
      bg2: '#0a2a96',
      surface: '#0b1c5a',
      fg: '#e9eefb',
      fg_dim: '#9fb0dc',
      accent: '#2f7dff',
      accent_strong: '#5296ff',
      border_inactive: '#1c2c66',
      border_active: '#2f7dff',
      urgent: '#ff6b6b',
      ok: '#36e6a6',
      warn: '#f2c25e',
    },
  },
  {
    name: 'herald-lagoon',
    label: 'MAXX Lagoon',
    description: 'Deep teal water with an aqua cyan accent.',
    scheme: 'dark' as const,
    source: 'builtin' as const,
    colors: {
      bg: '#04161a',
      bg2: '#072a30',
      surface: '#0b2f37',
      fg: '#e6f6f7',
      fg_dim: '#91bbbf',
      accent: '#2fd1c5',
      accent_strong: '#58e1d7',
      border_inactive: '#13424b',
      border_active: '#2fd1c5',
      urgent: '#ff6b6b',
      ok: '#5fd39a',
      warn: '#f2c25e',
    },
  },
  {
    name: 'herald-ember',
    label: 'MAXX Ember',
    description: 'Warm charcoal with a glowing neon orange accent.',
    scheme: 'dark' as const,
    source: 'builtin' as const,
    colors: {
      bg: '#140c0a',
      bg2: '#24130e',
      surface: '#2c1812',
      fg: '#f6ece6',
      fg_dim: '#bba196',
      accent: '#ff7a45',
      accent_strong: '#ff9466',
      border_inactive: '#3d241a',
      border_active: '#ff7a45',
      urgent: '#ff6b6b',
      ok: '#5fd39a',
      warn: '#f2c25e',
    },
  },
  {
    name: 'herald-violet',
    label: 'MAXX Violet',
    description: 'Deep cosmic night with a vivid violet purple accent.',
    scheme: 'dark' as const,
    source: 'builtin' as const,
    colors: {
      bg: '#04113f',
      bg2: '#0a2a96',
      surface: '#0b1c5a',
      fg: '#e9eefb',
      fg_dim: '#9fb0dc',
      accent: '#7c6cff',
      accent_strong: '#978aff',
      border_inactive: '#1c2c66',
      border_active: '#7c6cff',
      urgent: '#ff6b6b',
      ok: '#36e6a6',
      warn: '#f2c25e',
    },
  },
  {
    name: 'herald-forest',
    label: 'MAXX Forest',
    description: 'Deep matrix emerald with glowing neon green accent.',
    scheme: 'dark' as const,
    source: 'builtin' as const,
    colors: {
      bg: '#08130e',
      bg2: '#0d2219',
      surface: '#112a20',
      fg: '#e6f6ee',
      fg_dim: '#97bca9',
      accent: '#00FF66',
      accent_strong: '#46c58a',
      border_inactive: '#1b3b2d',
      border_active: '#00FF66',
      urgent: '#ff6b6b',
      ok: '#36e6a6',
      warn: '#f2c25e',
    },
  },
  {
    name: 'herald-graphite',
    label: 'MAXX Graphite',
    description: 'Minimalist pitch graphite with warm gold amber accent.',
    scheme: 'dark' as const,
    source: 'builtin' as const,
    colors: {
      bg: '#07080a',
      bg2: '#12141a',
      surface: '#171920',
      fg: '#f0f1f4',
      fg_dim: '#a0a3af',
      accent: '#e6b84a',
      accent_strong: '#f2c85c',
      border_inactive: '#252833',
      border_active: '#e6b84a',
      urgent: '#ff6b6b',
      ok: '#36e6a6',
      warn: '#f2c25e',
    },
  },
  {
    name: 'herald-ice',
    label: 'MAXX Ice',
    description: 'Glacial deep sapphire with vibrant ice blue accent.',
    scheme: 'dark' as const,
    source: 'builtin' as const,
    colors: {
      bg: '#04113f',
      bg2: '#082260',
      surface: '#0b1c5a',
      fg: '#e9eefb',
      fg_dim: '#9fb0dc',
      accent: '#4cc2ff',
      accent_strong: '#7ad3ff',
      border_inactive: '#1c2c66',
      border_active: '#4cc2ff',
      urgent: '#ff6b6b',
      ok: '#36e6a6',
      warn: '#f2c25e',
    },
  },
  {
    name: 'herald-rose',
    label: 'MAXX Rose',
    description: 'Deep crimson night with glowing neon rose accent.',
    scheme: 'dark' as const,
    source: 'builtin' as const,
    colors: {
      bg: '#170b10',
      bg2: '#28121d',
      surface: '#331725',
      fg: '#fbeff4',
      fg_dim: '#c99fb3',
      accent: '#ff6f9c',
      accent_strong: '#ff8fb4',
      border_inactive: '#441f32',
      border_active: '#ff6f9c',
      urgent: '#ff6b6b',
      ok: '#5fd39a',
      warn: '#f2c25e',
    },
  },
  {
    name: 'herald-cloud',
    label: 'MAXX Cloud (Claro)',
    description: 'Clean bright light glass with deep electric cobalt accent.',
    scheme: 'light' as const,
    source: 'builtin' as const,
    colors: {
      bg: '#eef2f8',
      bg2: '#dce4f0',
      surface: '#ffffff',
      fg: '#131b28',
      fg_dim: '#5b6a82',
      accent: '#2f6fe0',
      accent_strong: '#1d55bc',
      border_inactive: '#c8d4e6',
      border_active: '#2f6fe0',
      urgent: '#d93b3b',
      ok: '#1f9d60',
      warn: '#b37800',
    },
  },
]

const currentPrefs: any = {
  theme: 'ocean',
  themeName: 'herald-ocean',
  accent: 'blue',
  fullscreenOnLaunch: false,
  reduceMotion: false,
  spaces: [
    { id: 'default', name: 'MAXX IA', color: '#2f7dff' },
    { id: 'work', name: 'Trabalho', color: '#2fd1c5' },
  ],
  activeSpace: 'default',
  favorites: ['maxx-ia', 'hermes', 'overview'],
  voice: {
    enabled: false,
    engine: 'chained',
    wakeWord: false,
    hotkey: 'Alt+Space',
    followUpSeconds: 8,
    announceNotifications: false,
    followHermes: false,
    sttTuned: false,
    liveIdleSeconds: 45,
    liveDailyCapMinutes: 60,
    liveUsage: { day: '', seconds: 0 },
    inputDevice: null,
  },
  dictation: {
    enabled: false,
  },
  sound: true,
  themeScheme: 'dark',
  continuity: { enabled: false, exclude: [] },
  crashHelp: { enabled: true, muted: [] },
  notify: { dnd: false, silent: false, badges: true },
}

const noopListener = () => () => undefined

function applyMockTheme(themeName: string) {
  const found = BUILTIN_THEMES.find(
    (t) => t.name === themeName || t.name === `herald-${themeName}` || t.label.toLowerCase() === themeName.toLowerCase()
  )
  if (!found) return currentPrefs

  currentPrefs.themeName = found.name
  currentPrefs.theme = found.name.includes('graphite') ? 'graphite' : 'ocean'
  currentPrefs.themeColors = found.colors
  currentPrefs.themeScheme = found.scheme
  currentPrefs.accent = found.name.includes('violet') ? 'violet' : found.name.includes('ice') ? 'ice' : 'blue'

  $prefs.set({ ...currentPrefs })
  applyPrefsToDocument({ ...currentPrefs })
  return currentPrefs
}

function createSafeProxy(targetPath = 'root'): any {
  const handlerFn = (...args: any[]) => {
    if (typeof args[0] === 'function') {
      return () => undefined
    }
    return Promise.resolve([])
  }

  return new Proxy(handlerFn, {
    get(_target, prop: string | symbol) {
      if (typeof prop === 'symbol') return undefined
      if (prop === 'then') return undefined

      if (prop === 'surface' || prop === 'mode') return 'desktop'
      if (prop === 'isPackaged') return false
      if (prop === 'platform') return 'linux'
      if (prop === 'version') return '0.1.0-maxx'
      if (prop === 'productName') return 'MAXX OS'
      if (prop === 'enabled') return false

      // Theme API
      if (targetPath.endsWith('theme')) {
        if (prop === 'list') {
          return async () => BUILTIN_THEMES
        }
        if (prop === 'apply') {
          return async (name: string) => {
            return applyMockTheme(name)
          }
        }
      }

      // Prefs API
      if (targetPath.endsWith('prefs')) {
        if (prop === 'get') {
          return async () => ({ ...currentPrefs })
        }
        if (prop === 'set') {
          return async (patch: any) => {
            Object.assign(currentPrefs, patch)
            if (patch.themeName) {
              applyMockTheme(patch.themeName)
            } else {
              $prefs.set({ ...currentPrefs })
              applyPrefsToDocument({ ...currentPrefs })
            }
            return { ...currentPrefs }
          }
        }
      }

      if (prop === 'getState' && targetPath.endsWith('backend')) {
        return async () => ({ status: 'stopped', port: 8787 })
      }
      if (prop === 'getState' && targetPath.endsWith('window')) {
        return async () => ({ focused: true, visible: true, bounds: { x: 0, y: 0, width: 1280, height: 800 } })
      }
      if (prop === 'getState' && targetPath.endsWith('wm')) {
        return async () => ({
          available: false,
          windows: [],
          workspaces: [],
          focusedWindowId: null,
        })
      }
      if (prop === 'env') {
        return async () => ({ version: '0.1.0-maxx', productName: 'MAXX OS', platform: 'linux', arch: 'x64' })
      }
      if (prop === 'subscribeStats') {
        return noopListener
      }
      if (
        prop === 'onHotkey' ||
        prop === 'onState' ||
        prop === 'onCommand' ||
        prop === 'onReturned' ||
        prop === 'onChanged' ||
        prop === 'onEvent' ||
        prop === 'onTreeChanged'
      ) {
        return noopListener
      }

      return createSafeProxy(`${targetPath}.${prop}`)
    },
    apply(_target, _thisArg, args) {
      if (typeof args[0] === 'function') {
        return () => undefined
      }
      return Promise.resolve([])
    },
  })
}

if (typeof window !== 'undefined' && !(window as any).heraldOS) {
  const proxy = createSafeProxy('heraldOS')
  ;(window as any).heraldOS = proxy
  ;(window as any).maxxOS = proxy
  // Initialize default themes atom
  $themes.set(BUILTIN_THEMES as any)
} else if (typeof window !== 'undefined' && (window as any).heraldOS && !(window as any).maxxOS) {
  ;(window as any).maxxOS = (window as any).heraldOS
}

export { applyMockTheme }
