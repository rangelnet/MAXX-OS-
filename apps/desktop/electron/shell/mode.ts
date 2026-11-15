import type { ShellMode, ShellSurface } from '../../shared/ipc.ts'
import { osEnv } from '../env.ts'

/** `panels` only when the session asks for it (niri); everything else is the single-window desktop. */
export function shellMode(): ShellMode {
  return osEnv('SHELL_MODE') === 'panels' ? 'panels' : 'desktop'
}

/** Window titles double as the identity niri window rules match on; keep them stable. */
export const SURFACE_TITLE: Record<Exclude<ShellSurface, `window:${string}`>, string> = {
  desktop: 'MAXX OS',
  main: 'MAXX OS',
  menubar: 'MAXX OS · Menu Bar',
  dock: 'MAXX OS · Dock',
  command: 'MAXX OS · Command',
  panel: 'MAXX OS · Panel',
  screensaver: 'MAXX OS · Screensaver',
  wallpaper: 'MAXX OS · Wallpaper',
  emoji: 'MAXX OS · Emoji',
  pet: 'MAXX OS · Pet'
}

/** The Dock's menu for a running app: a window the Dock opens and draws into (electron/shell/dock-menu.ts). */
export const DOCK_MENU_TITLE = 'MAXX OS · Dock Menu'

/** Floating Hermes apps that may open as their own window in panels mode. */
export const FLOATING_APPS: Record<string, { title: string; width: number; height: number }> = {
  terminal: { title: 'MAXX OS · Terminal', width: 900, height: 560 },
  system: { title: 'MAXX OS · System', width: 980, height: 640 },
  'chat-popout': { title: 'MAXX OS · Chat', width: 520, height: 720 },
  studio: { title: 'MAXX OS · Studio', width: 1280, height: 800 },
  'capture-editor': { title: 'MAXX OS · Markup', width: 960, height: 680 },
  camera: { title: 'MAXX OS · Camera', width: 240, height: 240 },
  widget: { title: 'MAXX OS · Widget', width: 360, height: 280 },
  canvas: { title: 'MAXX OS · Canvas', width: 1320, height: 840 },
  docs: { title: 'MAXX OS · Docs', width: 1120, height: 840 },
  sheets: { title: 'MAXX OS · Sheets', width: 1280, height: 820 },
  slides: { title: 'MAXX OS · Slides', width: 1280, height: 820 },
  room: { title: 'MAXX OS · Pet Room', width: 1100, height: 720 },
  calc: { title: 'MAXX OS · Calc', width: 780, height: 560 }
}

export function surfaceTitle(surface: ShellSurface): string {
  if (surface.startsWith('window:')) {
    return FLOATING_APPS[surface.slice('window:'.length)]?.title ?? 'MAXX OS'
  }

  return SURFACE_TITLE[surface as keyof typeof SURFACE_TITLE]
}

export function parseSurface(value: string | null | undefined): ShellSurface {
  if (!value) {
    return 'desktop'
  }

  if (value.startsWith('window:') || value in SURFACE_TITLE) {
    return value as ShellSurface
  }

  return 'desktop'
}
