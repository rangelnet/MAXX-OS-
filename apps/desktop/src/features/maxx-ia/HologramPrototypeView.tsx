import { useState } from 'react'
import {
  IconCamera,
  IconCheck,
  IconChevronRight,
  IconCpu,
  IconEye,
  IconHeadphones,
  IconPalette,
  IconRotate,
  IconVolume,
} from '@tabler/icons-react'
import { Hologram3D } from './Hologram3D.tsx'
import {
  type HologramVisualState,
  type PerformanceTier,
} from './types.ts'
import { useStore } from '@nanostores/react'
import { $themes, applyTheme } from '../../store/themes.ts'
import { $prefs } from '../../store/backend.ts'

interface HologramPrototypeViewProps {
  onClose?: () => void
}

export function HologramPrototypeView({ onClose }: HologramPrototypeViewProps) {
  const [cameraMode, setCameraMode] = useState<'auto' | 'front' | 'perspective45' | 'profile'>('front')
  const [visualState, setVisualState] = useState<HologramVisualState>('ready')
  const [speakingOverride, setSpeakingOverride] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)
  const [tier, setTier] = useState<PerformanceTier>('high')

  const prefs = useStore($prefs)
  const themes = useStore($themes)

  const activeThemeName = prefs.themeName || 'herald-ocean'

  const selectAngle = (mode: 'front' | 'perspective45' | 'profile') => {
    setCameraMode(mode)
    setSpeakingOverride(false)
    setVisualState('ready')
    setAudioLevel(0)
  }

  const triggerSpeaking = () => {
    setCameraMode('auto')
    setSpeakingOverride(true)
    setVisualState('speaking')
    setAudioLevel(0.85)
  }

  const triggerThinking = () => {
    setCameraMode('perspective45')
    setSpeakingOverride(false)
    setVisualState('thinking')
    setAudioLevel(0.4)
  }

  return (
    <div className="flex h-full w-full flex-col bg-bg/95 p-6 text-fg select-none overflow-y-auto">
      {/* Top Banner */}
      <div className="flex items-center justify-between border-b border-line pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 items-center rounded-full bg-accent/20 px-2.5 text-[11px] font-bold text-accent tracking-wider uppercase">
              Protótipo Isolado
            </span>
            <h1 className="text-xl font-bold tracking-tight text-fg">
              Validação Tridimensional do Rosto Holográfico MAXX IA
            </h1>
          </div>
          <p className="mt-1 text-[13px] text-fg-3">
            Topologia anatômica 3D real com Wireframe Neural, Nuvem de Partículas, Fresnel Core e Articulação Dinâmica
          </p>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 rounded-xl border border-line bg-surface/60 px-4 py-2 text-[12px] font-semibold text-fg hover:border-accent hover:text-accent transition-all"
          >
            <span>Voltar ao MAXX IA Integrado</span>
            <IconChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Main Showcase Stage */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left / Center 3D Viewport */}
        <div className="lg:col-span-8 flex flex-col items-center justify-center rounded-2xl border border-line bg-surface/30 backdrop-blur-md p-6 relative overflow-hidden shadow-2xl min-h-[520px]">
          {/* Angle / State HUD Badge */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
            <span className="rounded-lg border border-line/60 bg-bg/80 backdrop-blur-sm px-3 py-1 text-[11px] font-mono font-medium text-accent flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-accent animate-ping" />
              {cameraMode === 'front' && 'VISTA 1: FRENTE (0°) — SIMETRIA FACIAL 3D'}
              {cameraMode === 'perspective45' && 'VISTA 2: PERSPECTIVA 45° — PROFUNDIDADE 3D (NARIZ, QUEIXO & MAÇÃS)'}
              {cameraMode === 'profile' && 'VISTA: PERFIL 86° — CONTORNO CRANIANO'}
              {cameraMode === 'auto' && speakingOverride && 'VISTA 3: FALA ATIVA — ARTICULAÇÃO 3D & PULSOS SINÁPTICOS'}
              {cameraMode === 'auto' && !speakingOverride && 'MODO: AUTÔNOMO 3D (RASTREAMENTO DE OLHAR)'}
            </span>
          </div>

          <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
            <span className="rounded-lg border border-line/60 bg-bg/80 px-2.5 py-1 text-[10px] font-mono text-fg-3">
              Tier: <strong className="text-fg uppercase">{tier}</strong> | Face Feminina Neural & Constelação
            </span>
          </div>

          {/* 3D WebGL Hologram Component */}
          <div className="w-full h-[460px] flex items-center justify-center relative">
            <Hologram3D
              visualState={visualState}
              tier={tier}
              cameraMode={cameraMode}
              speakingOverride={speakingOverride}
              audioLevel={audioLevel}
              width={640}
              height={440}
              interactive={true}
            />
          </div>

          {/* Dedicated Camera Angle Selector Bar */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 w-full border-t border-line/50 pt-4">
            <button
              id="btn-proto-front"
              type="button"
              onClick={() => selectAngle('front')}
              className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-[12px] font-semibold transition-all ${
                cameraMode === 'front' && !speakingOverride
                  ? 'border-accent bg-accent text-white shadow-lg shadow-accent/20 scale-105'
                  : 'border-line bg-surface/50 text-fg-2 hover:border-accent/60 hover:text-fg'
              }`}
            >
              <IconCamera className="h-4 w-4" />
              <span>1. Rosto Visto de Frente (0°)</span>
            </button>

            <button
              id="btn-proto-45"
              type="button"
              onClick={() => selectAngle('perspective45')}
              className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-[12px] font-semibold transition-all ${
                cameraMode === 'perspective45' && !speakingOverride
                  ? 'border-accent bg-accent text-white shadow-lg shadow-accent/20 scale-105'
                  : 'border-line bg-surface/50 text-fg-2 hover:border-accent/60 hover:text-fg'
              }`}
            >
              <IconRotate className="h-4 w-4" />
              <span>2. Rosto em Perspectiva (45°)</span>
            </button>

            <button
              id="btn-proto-speak"
              type="button"
              onClick={triggerSpeaking}
              className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-[12px] font-semibold transition-all ${
                speakingOverride
                  ? 'border-accent bg-accent text-white shadow-lg shadow-accent/20 scale-105'
                  : 'border-line bg-surface/50 text-fg-2 hover:border-accent/60 hover:text-fg'
              }`}
            >
              <IconVolume className="h-4 w-4" />
              <span>3. Fala e Articulação 3D</span>
            </button>

            <button
              id="btn-proto-think"
              type="button"
              onClick={triggerThinking}
              className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-[12px] font-semibold transition-all ${
                visualState === 'thinking' && !speakingOverride
                  ? 'border-accent bg-accent text-white shadow-lg shadow-accent/20 scale-105'
                  : 'border-line bg-surface/50 text-fg-2 hover:border-accent/60 hover:text-fg'
              }`}
            >
              <IconEye className="h-4 w-4" />
              <span>Processamento / Pensando</span>
            </button>
          </div>
        </div>

        {/* Right Inspection & Test Controls */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          {/* Hardware & Tiers */}
          <div className="rounded-2xl border border-line bg-surface/30 backdrop-blur-md p-5">
            <h3 className="text-[13px] font-semibold text-fg flex items-center gap-2">
              <IconCpu className="h-4 w-4 text-accent" />
              <span>Níveis de Desempenho (3D Hardware)</span>
            </h3>
            <p className="mt-1 text-[11px] text-fg-3">
              Adaptação automática para diferentes capacidades de GPU e notebook
            </p>

            <div className="mt-3 grid grid-cols-2 gap-2">
              {(['high', 'balanced', 'eco', 'compatibility'] as PerformanceTier[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTier(t)}
                  className={`rounded-xl border py-2.5 px-2 text-center text-[11px] font-medium transition-all ${
                    tier === t
                      ? 'border-accent bg-accent/20 text-accent font-semibold shadow'
                      : 'border-line bg-surface/30 text-fg-3 hover:text-fg'
                  }`}
                >
                  {t === 'high' && 'Alto (3D Scan Full)'}
                  {t === 'balanced' && 'Equilibrado'}
                  {t === 'eco' && 'Econômico (3D Leve)'}
                  {t === 'compatibility' && 'Compatibilidade 2D'}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Theme Testing */}
          <div className="rounded-2xl border border-line bg-surface/30 backdrop-blur-md p-5">
            <h3 className="text-[13px] font-semibold text-fg flex items-center gap-2">
              <IconPalette className="h-4 w-4 text-accent" />
              <span>Teste de Cores do Tema Ativo</span>
            </h3>
            <p className="mt-1 text-[11px] text-fg-3">
              Validação de sincronização instantânea do holograma com o motor MAXX OS
            </p>

            <div className="mt-3 flex flex-col gap-1.5 max-h-[180px] overflow-y-auto pr-1">
              {themes.map((th) => {
                const isActive = activeThemeName === th.name
                return (
                  <button
                    key={th.name}
                    type="button"
                    onClick={() => applyTheme(th.name)}
                    className={`flex items-center justify-between rounded-xl border px-3 py-2 text-[12px] transition-all ${
                      isActive
                        ? 'border-accent bg-surface-3 text-fg font-medium shadow-sm'
                        : 'border-line/40 bg-surface/20 text-fg-3 hover:border-line hover:text-fg'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="h-3 w-3 rounded-full border border-white/20 shrink-0"
                        style={{ backgroundColor: th.colors.accent }}
                      />
                      <span>{th.label}</span>
                    </div>
                    {isActive && <IconCheck className="h-3.5 w-3.5 text-accent" />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Technical Specs Summary */}
          <div className="rounded-2xl border border-line bg-surface/20 p-4 text-[11px] text-fg-3 space-y-2">
            <div className="font-semibold text-fg flex items-center gap-1.5">
              <IconHeadphones className="h-3.5 w-3.5 text-accent" />
              <span>Especificações da Topologia 3D:</span>
            </div>
            <ul className="list-disc pl-4 space-y-1">
              <li><strong>Face Feminina 3D:</strong> Topologia delicada com pálpebras sonhadoras serenas</li>
              <li><strong>Ondas Especulares:</strong> Fitas ondulatórias de energia neural cósmica</li>
              <li><strong>Constelação Neural:</strong> 90 nós estelares e filamentos conectivos 3D</li>
              <li><strong>Casca Fresnel:</strong> Rim lighting translúcido sem saturação posterior</li>
              <li><strong>Articulação 3D:</strong> Deslocamento vetorial dinâmico de lábios e mandíbula</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
