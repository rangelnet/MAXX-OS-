import {
  IconActivity,
  IconCheck,
  IconChevronRight,
  IconCpu,
  IconDeviceDesktop,
  IconMicrophone,
  IconStack2,
  IconVolume,
} from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import type { JarvisHealth } from './use-maxx-ia.ts'
import type { HologramPalette } from './types.ts'

interface SystemStatusSidebarProps {
  palette: HologramPalette
  connection: string
  isMicActive: boolean
  audioLevel: number
  jarvisHealth: JarvisHealth
  onTestVoice: () => void
  voiceTesting: boolean
  voiceTestStatus: string | null
  onOpenAdvanced?: () => void
}

export function SystemStatusSidebar({
  connection,
  isMicActive,
  audioLevel,
  jarvisHealth,
  onTestVoice,
  voiceTesting,
  voiceTestStatus,
  onOpenAdvanced,
}: SystemStatusSidebarProps) {
  const [waveSeed, setWaveSeed] = useState(0)

  // Waveform equalizer animation loop
  useEffect(() => {
    let animId: number
    const tick = () => {
      setWaveSeed((s) => (s + 1) % 1000)
      animId = requestAnimationFrame(tick)
    }
    animId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(animId)
  }, [])

  // Equalizer bars (24 bars)
  const barCount = 24
  const bars = Array.from({ length: barCount }, (_, i) => {
    const centerDist = Math.abs(i - barCount / 2) / (barCount / 2)
    const bellCurve = Math.cos(centerDist * Math.PI * 0.45)
    const baseWave = Math.sin((waveSeed * 0.08) + i * 0.5) * 0.5 + 0.5
    const dynamicAmp = isMicActive || audioLevel > 0
      ? 18 + Math.max(audioLevel * 32, 12) * baseWave * bellCurve
      : 8 + baseWave * 10 * bellCurve
    return Math.max(4, Math.min(38, dynamicAmp))
  })

  return (
    <div className="flex h-full w-[285px] shrink-0 flex-col gap-2.5 select-none overflow-y-auto pr-1">
      {/* 1. CARD ÁUDIO E VOZ */}
      <div className="glass-card rounded-2xl p-4 transition-all">
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-line bg-accent/15 text-accent shadow-sm">
              <IconMicrophone className="h-4 w-4" />
            </div>
            <h3 className="text-[13px] font-semibold tracking-wide text-fg">Áudio e Voz</h3>
          </div>
          <span className="text-[10px] uppercase tracking-wider text-fg-3 font-medium">Neural</span>
        </div>

        {/* Audio Waveform Visualizer */}
        <div className="my-2 flex h-12 items-center justify-center gap-1 rounded-xl bg-surface/40 px-3 py-1 border border-line">
          {bars.map((h, idx) => (
            <div
              key={idx}
              className="w-1.5 rounded-full transition-all duration-75"
              style={{
                height: `${h}px`,
                backgroundColor:
                  idx % 3 === 0
                    ? 'var(--color-accent)'
                    : idx % 3 === 1
                    ? 'var(--color-accent-strong)'
                    : 'var(--color-fg-2)',
                boxShadow: isMicActive ? '0 0 8px var(--color-accent-soft)' : undefined,
              }}
            />
          ))}
        </div>

        {/* Audio Status & Voice Selector */}
        <div className="mt-3 flex flex-col gap-2">
          <div className="flex items-center justify-between text-[11.5px]">
            <div className="flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full ${
                  isMicActive
                    ? 'bg-ok shadow-[0_0_8px_#36e6a6]'
                    : 'bg-fg-3 opacity-60'
                }`}
              />
              <span className="text-fg-2">
                {isMicActive ? 'Ouvindo e respondendo...' : 'Microfone em espera'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-surface/50 p-2 border border-line text-[11.5px]">
            <div className="flex items-center gap-2">
              <IconVolume className="h-3.5 w-3.5 text-fg-3" />
              <span className="text-fg font-medium">Voz: Razo (Piper)</span>
            </div>
            <button
              type="button"
              disabled={voiceTesting}
              onClick={onTestVoice}
              className="rounded-lg px-2.5 py-0.5 text-[10.5px] font-medium border border-line bg-surface-2 hover:bg-surface-3 transition-colors text-fg active:scale-95"
            >
              {voiceTesting ? 'Testando...' : 'Testar'}
            </button>
          </div>

          {voiceTestStatus && (
            <div className="text-[10px] text-fg-3 truncate px-1">
              {voiceTestStatus}
            </div>
          )}
        </div>
      </div>

      {/* 2. CARD INTEGRAÇÃO DO SISTEMA */}
      <div className="glass-card rounded-2xl p-4 transition-all">
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-line bg-accent/15 text-accent shadow-sm">
              <IconStack2 className="h-4 w-4" />
            </div>
            <h3 className="text-[13px] font-semibold tracking-wide text-fg">Integração do Sistema</h3>
          </div>
          {onOpenAdvanced && (
            <button
              type="button"
              onClick={onOpenAdvanced}
              className="text-[10px] text-accent hover:underline font-medium"
            >
              Temas & Ajustes
            </button>
          )}
        </div>

        <div className="flex flex-col gap-1.5 text-[12px]">
          {/* Hermes Agent */}
          <div className="flex items-center justify-between rounded-xl bg-surface/30 px-2.5 py-2 border border-line hover:bg-surface-2 transition-colors">
            <div className="flex items-center gap-2.5">
              <div className="flex h-4 w-4 items-center justify-center rounded-full bg-ok/20 text-ok border border-ok/40">
                <IconCheck className="h-2.5 w-2.5" />
              </div>
              <span className="text-fg-2 font-medium">Hermes Agent</span>
            </div>
            <div className="flex items-center gap-1">
              <span className={`text-[10px] ${connection === 'open' ? 'text-ok font-medium' : 'text-warn'}`}>
                {connection === 'open' ? 'Conectado' : 'Aguardando'}
              </span>
              <IconChevronRight className="h-3.5 w-3.5 text-fg-4" />
            </div>
          </div>

          {/* Comandos do Sistema */}
          <div className="flex items-center justify-between rounded-xl bg-surface/30 px-2.5 py-2 border border-line hover:bg-surface-2 transition-colors">
            <div className="flex items-center gap-2.5">
              <div className="flex h-4 w-4 items-center justify-center rounded-full bg-ok/20 text-ok border border-ok/40">
                <IconCheck className="h-2.5 w-2.5" />
              </div>
              <span className="text-fg-2 font-medium">Comandos do Sistema</span>
            </div>
            <IconChevronRight className="h-3.5 w-3.5 text-fg-4" />
          </div>

          {/* Execução de Aplicativos */}
          <div className="flex items-center justify-between rounded-xl bg-surface/30 px-2.5 py-2 border border-line hover:bg-surface-2 transition-colors">
            <div className="flex items-center gap-2.5">
              <div className="flex h-4 w-4 items-center justify-center rounded-full bg-ok/20 text-ok border border-ok/40">
                <IconCheck className="h-2.5 w-2.5" />
              </div>
              <span className="text-fg-2 font-medium">Execução de Aplicativos</span>
            </div>
            <IconChevronRight className="h-3.5 w-3.5 text-fg-4" />
          </div>

          {/* Android Core */}
          <div className="flex items-center justify-between rounded-xl bg-surface/30 px-2.5 py-2 border border-line hover:bg-surface-2 transition-colors">
            <div className="flex items-center gap-2.5">
              <div className="flex h-4 w-4 items-center justify-center rounded-full bg-ok/20 text-ok border border-ok/40">
                <IconCheck className="h-2.5 w-2.5" />
              </div>
              <span className="text-fg-2 font-medium">Android Core</span>
            </div>
            <IconChevronRight className="h-3.5 w-3.5 text-fg-4" />
          </div>

          {/* Windows Runtime / JARVIS */}
          <div className="flex items-center justify-between rounded-xl bg-surface/30 px-2.5 py-2 border border-line hover:bg-surface-2 transition-colors">
            <div className="flex items-center gap-2.5">
              <div className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                jarvisHealth.online
                  ? 'bg-ok/20 text-ok border-ok/40'
                  : 'bg-warn/20 text-warn border-warn/40'
              }`}>
                <IconCheck className="h-2.5 w-2.5" />
              </div>
              <span className="text-fg-2 font-medium">JARVIS / Windows Core</span>
            </div>
            <div className="flex items-center gap-1">
              <span className={`text-[10px] ${jarvisHealth.online ? 'text-ok' : 'text-fg-3'}`}>
                {jarvisHealth.online ? 'Ativo (8790)' : 'Offline'}
              </span>
              <IconChevronRight className="h-3.5 w-3.5 text-fg-4" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. CARD ESTADO DA IA */}
      <div className="glass-card rounded-2xl p-4 transition-all">
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-line bg-accent/15 text-accent shadow-sm">
              <IconActivity className="h-4 w-4" />
            </div>
            <h3 className="text-[13px] font-semibold tracking-wide text-fg">Estado da IA</h3>
          </div>
          <span className="rounded-full bg-ok/15 text-ok border border-ok/30 px-2 py-0.5 text-[10px] font-semibold">
            Ativo
          </span>
        </div>

        <div className="flex flex-col gap-3 text-[11.5px]">
          {/* CPU / Processamento */}
          <div>
            <div className="flex justify-between text-fg-2 pb-1">
              <span className="flex items-center gap-1.5">
                <IconCpu className="h-3.5 w-3.5 text-fg-3" />
                Processamento
              </span>
              <span className="font-semibold text-fg">34%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-surface-3 overflow-hidden border border-line">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: '34%',
                  backgroundColor: 'var(--color-accent)',
                  boxShadow: '0 0 6px var(--color-accent-soft)',
                }}
              />
            </div>
          </div>

          {/* Memória RAM */}
          <div>
            <div className="flex justify-between text-fg-2 pb-1">
              <span className="flex items-center gap-1.5">
                <IconDeviceDesktop className="h-3.5 w-3.5 text-fg-3" />
                Memória (RAM)
              </span>
              <span className="font-semibold text-fg">4,2 GB / 8 GB</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-surface-3 overflow-hidden border border-line">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: '52.5%',
                  backgroundColor: 'var(--color-accent-strong)',
                  boxShadow: '0 0 6px var(--color-accent-soft)',
                }}
              />
            </div>
          </div>

          {/* Gráficos GPU */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-fg-2 font-medium">Gráficos (GPU)</span>
            <span className="rounded-md bg-ok/20 border border-ok/40 px-2 py-0.5 text-[10.5px] font-semibold text-ok shadow-[0_0_8px_rgba(54,230,166,0.25)]">
              Ativo
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
