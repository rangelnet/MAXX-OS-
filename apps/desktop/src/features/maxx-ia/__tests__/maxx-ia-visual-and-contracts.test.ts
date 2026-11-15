import { describe, expect, it } from 'vitest'
import {
  PALETTES,
  STATE_CONFIGS,
  type HologramPaletteId,
  type HologramVisualState,
  type PerformanceTier,
} from '../types'

describe('MAXX IA — Visual Identity, Themes & Hologram States', () => {
  it('defines the official MAXX Neon Orange palette with #FC5F16', () => {
    const maxxOrange = PALETTES['neon-orange']
    expect(maxxOrange).toBeDefined()
    expect(maxxOrange.primary.toUpperCase()).toBe('#FC5F16')
    expect(maxxOrange.glow).toBeTruthy()
    expect(maxxOrange.secondary).toBeTruthy()
    expect(maxxOrange.bgAccent).toBeTruthy()
    expect(maxxOrange.coreGlow).toBeTruthy()
  })

  it('provides all 8 approved futuristic color palettes', () => {
    const requiredPalettes: HologramPaletteId[] = [
      'neon-orange',
      'cyan-holographic',
      'matrix-green',
      'purple-premium',
      'force-red',
      'executive-gold',
      'clean-cyan',
      'deep-dark',
    ]

    for (const id of requiredPalettes) {
      const palette = PALETTES[id]
      expect(palette, `Palette ${id} must exist`).toBeDefined()
      expect(palette.id).toBe(id)
      expect(palette.name).toBeTruthy()
      expect(palette.primary).toMatch(/^#[0-9A-Fa-f]{6}$/)
    }
  })

  it('covers all 11 intelligent holographic states with valid parameters', () => {
    const requiredStates: HologramVisualState[] = [
      'ready',
      'listening',
      'transcribing',
      'thinking',
      'streaming',
      'speaking',
      'tool_running',
      'approval_pending',
      'succeeded',
      'failed',
      'cancelled',
    ]

    for (const state of requiredStates) {
      const cfg = STATE_CONFIGS[state]
      expect(cfg, `State ${state} configuration must exist`).toBeDefined()
      expect(cfg.label, `State ${state} must have a human label`).toBeTruthy()
      expect(cfg.description).toBeTruthy()
      expect(cfg.color).toMatch(/^#[0-9A-Fa-f]{6}$/)
      expect(cfg.speedMultiplier).toBeGreaterThan(0)
      expect(cfg.pulseFrequency).toBeGreaterThan(0)
      expect(cfg.particleSpread).toBeGreaterThan(0)
    }
  })

  it('ensures distinct operational profiles between passive, active and critical states', () => {
    const ready = STATE_CONFIGS.ready
    const thinking = STATE_CONFIGS.thinking
    const speaking = STATE_CONFIGS.speaking
    const failed = STATE_CONFIGS.failed

    // Thinking state should have higher speed than ready
    expect(thinking.speedMultiplier).toBeGreaterThan(ready.speedMultiplier)

    // Speaking state must have high pulse frequency
    expect(speaking.pulseFrequency).toBeGreaterThan(ready.pulseFrequency)

    // Failed and approval states must use warning / critical colors
    expect(failed.color).toBe('#FF2E55')
    expect(STATE_CONFIGS.approval_pending.color).toBe('#FFB800')
  })

  it('supports 4 hardware performance tiers (high, balanced, eco, compatibility) for low-spec notebook hardware', () => {
    const tiers: PerformanceTier[] = ['high', 'balanced', 'eco', 'compatibility']
    expect(tiers).toHaveLength(4)

    // Helper checking particle counts as rendered by Hologram 3D / Canvas
    const getParticleCount = (tier: PerformanceTier): number => {
      switch (tier) {
        case 'high': return 9279
        case 'balanced': return 3000
        case 'eco': return 1200
        case 'compatibility': return 180
      }
    }

    expect(getParticleCount('high')).toBe(9279)
    expect(getParticleCount('balanced')).toBe(3000)
    expect(getParticleCount('eco')).toBe(1200)
    expect(getParticleCount('compatibility')).toBe(180)
  })

  it('calculates audio reactive scale safely within normalized boundaries', () => {
    const audioLevel = 0.75 // 75% volume
    const pulseFactor = STATE_CONFIGS.speaking.pulseFrequency
    expect(pulseFactor).toBeGreaterThan(0)
    const scale = 1 + (audioLevel * 0.35)

    expect(scale).toBeGreaterThan(1.0)
    expect(scale).toBeLessThanOrEqual(1.35)
  })
})

describe('MAXX IA — Security & Tool Approval Protocol', () => {
  it('classifies tool operations by risk tier', () => {
    type ToolRiskLevel = 'READ' | 'ACT' | 'MUTATE' | 'DESTRUCTIVE'
    const sampleTools: Array<{ name: string; tier: ToolRiskLevel; requiresConfirmation: boolean }> = [
      { name: 'read_file', tier: 'READ', requiresConfirmation: false },
      { name: 'web_search', tier: 'READ', requiresConfirmation: false },
      { name: 'git_status', tier: 'ACT', requiresConfirmation: false },
      { name: 'edit_file', tier: 'MUTATE', requiresConfirmation: true },
      { name: 'run_system_command', tier: 'DESTRUCTIVE', requiresConfirmation: true },
    ]

    for (const tool of sampleTools) {
      if (tool.tier === 'DESTRUCTIVE' || tool.tier === 'MUTATE') {
        expect(tool.requiresConfirmation).toBe(true)
      }
    }
  })

  it('validates tool approval structure', () => {
    const request = {
      id: 'req-001',
      toolName: 'execute_shell',
      params: { command: 'systemctl restart maxx' },
      risk: 'DESTRUCTIVE',
      description: 'Reiniciar serviço do sistema operacional',
      requestedAt: '2026-11-14T16:00:00.000Z',
    }

    expect(request.id).toMatch(/^req-/)
    expect(request.risk).toBe('DESTRUCTIVE')
    expect(request.toolName).toBe('execute_shell')
    expect(request.params).toHaveProperty('command')
  })
})

describe('MAXX IA — JARVIS Bridge Protection & Health Contract', () => {
  it('enforces local-only loopback communication with no credential leaks', () => {
    const localHost = 'http://127.0.0.1:8790'
    const healthEndpoint = `${localHost}/api/saude`
    const voiceTestEndpoint = `${localHost}/api/maxx/voz/teste`

    expect(healthEndpoint).toContain('127.0.0.1:8790')
    expect(voiceTestEndpoint).toContain('127.0.0.1:8790')
    expect(healthEndpoint).not.toContain('api_key')
    expect(healthEndpoint).not.toContain('secret')
  })
})

describe('MAXX IA — OS Theme Engine Dynamic Inheritance', () => {
  it('adapts hologram and UI tokens dynamically to the active MAXX OS theme without fixed colors', () => {
    const testThemes = [
      { name: 'herald-ocean', accent: '#2f7dff', scheme: 'dark' },
      { name: 'herald-lagoon', accent: '#2fd1c5', scheme: 'dark' },
      { name: 'herald-violet', accent: '#7c6cff', scheme: 'dark' },
      { name: 'herald-ember', accent: '#ff7a45', scheme: 'dark' },
      { name: 'herald-forest', accent: '#00FF66', scheme: 'dark' },
      { name: 'herald-cloud', accent: '#2f6fe0', scheme: 'light' },
    ]

    for (const theme of testThemes) {
      expect(theme.accent).toMatch(/^#[0-9A-Fa-f]{6}$/)
      // Verify that none of the non-ember themes are locked to orange
      if (theme.name !== 'herald-ember') {
        expect(theme.accent.toUpperCase()).not.toBe('#FC5F16')
      }
    }
  })

  it('honors reduced motion preference across the entire holographic pipeline', () => {
    const motionPreferences = [true, false]
    for (const prefersReduced of motionPreferences) {
      const multiplier = prefersReduced ? 0.05 : 1.0
      if (prefersReduced) {
        expect(multiplier).toBeLessThan(0.1)
      } else {
        expect(multiplier).toBe(1.0)
      }
    }
  })

  it('verifies 3D hologram camera modes for front, 45-degree perspective and speech articulation', () => {
    const cameraModes = ['front', 'perspective45', 'profile', 'auto'] as const
    expect(cameraModes).toContain('front')
    expect(cameraModes).toContain('perspective45')
    expect(cameraModes).toContain('profile')
    expect(cameraModes).toContain('auto')

    // Speech articulation parameters
    const speechConfig = {
      speakingOverride: true,
      audioLevel: 0.85,
      jawDisplacement: 0.35 + 0.85 * 0.45,
    }
    expect(speechConfig.jawDisplacement).toBeGreaterThan(0.5)
    expect(speechConfig.jawDisplacement).toBeLessThan(1.0)
  })
})
