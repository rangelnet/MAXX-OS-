// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest'
import type { WmWindow } from '../../../shared/ipc.ts'
import { OUR_MAIN_TITLE, ourFloatingAppId } from './shell-utils.ts'

describe('MAXX OS window identity', () => {
  it('uses the visible MAXX title while preserving the existing app id', () => {
    const win: WmWindow = { id: 1, title: 'MAXX OS · Terminal', appId: 'herald-os', pid: 1, workspaceId: 1, focused: false, floating: true, urgent: false, ours: true }

    expect(OUR_MAIN_TITLE).toBe('MAXX OS')
    expect(ourFloatingAppId(win)).toBe('terminal')
  })
})
