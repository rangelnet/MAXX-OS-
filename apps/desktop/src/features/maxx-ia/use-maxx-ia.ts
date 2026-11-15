import { useStore } from '@nanostores/react'
import { useCallback, useEffect, useState } from 'react'
import { withAlpha } from '../../../shared/theme.ts'
import { $activeChat, $activeChatId, createChat } from '../../store/chat.ts'
import { $connection, gatewayRequest } from '../../store/gateway.ts'
import { $prefs } from '../../store/backend.ts'
import { $themes, applyTheme } from '../../store/themes.ts'
import {
  type HologramPalette,
  type HologramPaletteId,
  type HologramVisualState,
  type PerformanceTier,
} from './types.ts'

export interface JarvisHealth {
  online: boolean
  status: string
  modelLoaded: string | null
  voiceRazoActive: boolean
  lastChecked: string | null
  port: number
}

export function useMaxxIa() {
  const connection = useStore($connection)
  const chat = useStore($activeChat)
  const activeChatId = useStore($activeChatId)
  const prefs = useStore($prefs)
  const themes = useStore($themes)

  const [tier, setTier] = useState<PerformanceTier>('balanced')
  const [visualState, setVisualState] = useState<HologramVisualState>('ready')
  const [audioLevel, setAudioLevel] = useState(0)
  const [isMicActive, setIsMicActive] = useState(false)
  const [jarvisHealth, setJarvisHealth] = useState<JarvisHealth>({
    online: false,
    status: 'Sondando...',
    modelLoaded: null,
    voiceRazoActive: false,
    lastChecked: null,
    port: 8790,
  })
  const [voiceTestStatus, setVoiceTestStatus] = useState<string | null>(null)
  const [voiceTesting, setVoiceTesting] = useState(false)

  // Reduced motion inherits directly from MAXX OS preferences or media query
  const reducedMotion = prefs.reduceMotion

  // Dynamically derive palette from the active MAXX OS theme
  const activeThemeName = prefs.themeName ?? `herald-${prefs.theme}`
  const foundTheme = themes.find(
    (t) => t.name === activeThemeName || t.name === prefs.themeName || t.name === prefs.theme
  )

  const accentColor =
    prefs.themeColors?.accent ??
    (prefs.theme === 'graphite'
      ? '#e6b84a'
      : prefs.accent === 'violet'
      ? '#7c6cff'
      : prefs.accent === 'ice'
      ? '#4cc2ff'
      : '#2f7dff')

  const accentStrongColor = prefs.themeColors?.accent_strong ?? accentColor

  const palette: HologramPalette = {
    id: (activeThemeName.replace(/^herald-/, '') as any) || 'ocean',
    name: foundTheme?.label ?? (prefs.theme === 'graphite' ? 'MAXX Graphite' : 'MAXX Ocean'),
    primary: accentColor,
    secondary: accentStrongColor,
    glow: withAlpha(accentColor, 0.65),
    bgAccent: withAlpha(accentColor, 0.15),
    coreGlow: withAlpha(accentColor, 0.85),
  }

  const paletteId: HologramPaletteId = (activeThemeName.replace(/^herald-/, '') as HologramPaletteId)

  const setPaletteId = useCallback(async (id: HologramPaletteId) => {
    const mapping: Record<string, string> = {
      'neon-orange': 'herald-ember',
      'cyan-holographic': 'herald-lagoon',
      'matrix-green': 'herald-forest',
      'purple-premium': 'herald-violet',
      'force-red': 'herald-rose',
      'executive-gold': 'herald-graphite',
      'clean-cyan': 'herald-ice',
      'deep-dark': 'herald-onyx',
    }
    const themeName = mapping[id] ?? `herald-${id}`
    try {
      await applyTheme(themeName)
    } catch (e) {
      console.warn('Failed to apply theme from paletteId:', e)
    }
  }, [])

  // Check JARVIS health on mount and periodically
  const checkJarvisHealth = useCallback(async () => {
    try {
      const res = await fetch('http://127.0.0.1:8790/api/saude', {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(2000),
      })
      if (res.ok) {
        const data = await res.json()
        setJarvisHealth({
          online: true,
          status: data.status || 'Operacional',
          modelLoaded: data.modelo || data.model || 'JARVIS Local',
          voiceRazoActive: Boolean(data.voz_ativa ?? true),
          lastChecked: new Date().toLocaleTimeString(),
          port: 8790,
        })
      } else {
        setJarvisHealth((prev) => ({
          ...prev,
          online: false,
          status: `HTTP ${res.status}`,
          lastChecked: new Date().toLocaleTimeString(),
        }))
      }
    } catch {
      setJarvisHealth((prev) => ({
        ...prev,
        online: false,
        status: 'Offline / Standalone',
        lastChecked: new Date().toLocaleTimeString(),
      }))
    }
  }, [])

  useEffect(() => {
    checkJarvisHealth()
    const timer = setInterval(checkJarvisHealth, 30_000)
    return () => clearInterval(timer)
  }, [checkJarvisHealth])

  // Trigger Piper Razo Voice Test
  const triggerVoiceTest = useCallback(async () => {
    setVoiceTesting(true)
    setVoiceTestStatus('Iniciando teste de voz Razo...')
    setVisualState('speaking')

    try {
      const res = await fetch('http://127.0.0.1:8790/api/maxx/voz/teste', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto: 'MAXX IA online. Voz Razo operacional no MAXX OS.' }),
        signal: AbortSignal.timeout(6000),
      })

      if (res.ok) {
        setVoiceTestStatus('Voz Razo reproduzida com sucesso!')
        setVisualState('succeeded')
        setTimeout(() => setVisualState('ready'), 2500)
      } else {
        setVoiceTestStatus(`Falha no teste: HTTP ${res.status}`)
        setVisualState('failed')
        setTimeout(() => setVisualState('ready'), 3000)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao conectar no backend de voz'
      setVoiceTestStatus(`Backend de voz indisponível (${msg})`)
      setVisualState('failed')
      setTimeout(() => setVisualState('ready'), 3000)
    } finally {
      setVoiceTesting(false)
    }
  }, [])

  // Sync conversation state with Hermes chat store
  useEffect(() => {
    if (connection !== 'open') {
      setVisualState('ready')
      return
    }

    if (voiceTesting) {
      return
    }

    if (isMicActive) {
      setVisualState('listening')
      return
    }

    if (!chat) {
      setVisualState('ready')
      return
    }

    if (chat.streaming) {
      const lastMsg = chat.messages[chat.messages.length - 1]
      if (lastMsg && lastMsg.role === 'assistant') {
        if (lastMsg.reasoning && !lastMsg.text) {
          setVisualState('thinking')
        } else {
          setVisualState('streaming')
        }
      } else {
        setVisualState('thinking')
      }
      return
    }

    const hasRunningTool = chat.messages.some((m) => m.role === 'tool' && m.running)
    if (hasRunningTool) {
      setVisualState('tool_running')
      return
    }

    setVisualState('ready')
  }, [chat, connection, isMicActive, voiceTesting])

  // Send prompt to Hermes
  const sendMessage = useCallback(
    async (text: string) => {
      const clean = text.trim()
      if (!clean) return

      let targetId = activeChatId

      if (!targetId || !chat) {
        const newChat = await createChat({ title: clean.slice(0, 32) })
        targetId = newChat.sessionId
      }

      setVisualState('thinking')

      try {
        await gatewayRequest('prompt.submit', {
          session_id: targetId,
          text: clean,
        })
      } catch (err) {
        console.error('Failed to submit prompt:', err)
        setVisualState('failed')
        setTimeout(() => setVisualState('ready'), 3000)
      }
    },
    [activeChatId, chat]
  )

  const toggleMic = useCallback(() => {
    setIsMicActive((prev) => {
      const next = !prev
      if (next) {
        setVisualState('listening')
        setAudioLevel(0.8)
      } else {
        setAudioLevel(0)
        setVisualState('ready')
      }
      return next
    })
  }, [])

  return {
    connection,
    chat,
    visualState,
    setVisualState,
    palette,
    paletteId,
    setPaletteId,
    tier,
    setTier,
    reducedMotion,
    audioLevel,
    isMicActive,
    toggleMic,
    jarvisHealth,
    checkJarvisHealth,
    triggerVoiceTest,
    voiceTestStatus,
    voiceTesting,
    sendMessage,
    currentThemeName: activeThemeName,
  }
}
