import {
  IconCpu,
  IconMicrophone,
  IconMicrophoneOff,
  IconPalette,
  IconPlayerPlay,
  IconSparkles,
  IconVolume,
} from '@tabler/icons-react'
import {
  type HologramPalette,
  type HologramPaletteId,
  type HologramVisualState,
  PALETTES,
  type PerformanceTier,
  STATE_CONFIGS,
} from './types.ts'

interface HologramControlsProps {
  palette: HologramPalette
  paletteId: HologramPaletteId
  onSelectPalette: (id: HologramPaletteId) => void
  visualState: HologramVisualState
  onSelectState: (state: HologramVisualState) => void
  tier: PerformanceTier
  onSelectTier: (tier: PerformanceTier) => void
  isMicActive: boolean
  onToggleMic: () => void
  onTriggerVoiceTest: () => void
  voiceTesting: boolean
  voiceTestStatus: string | null
}

export function HologramControls({
  palette,
  paletteId,
  onSelectPalette,
  visualState,
  onSelectState,
  tier,
  onSelectTier,
  isMicActive,
  onToggleMic,
  onTriggerVoiceTest,
  voiceTesting,
  voiceTestStatus,
}: HologramControlsProps) {
  const allStates: HologramVisualState[] = [
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

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-black/40 p-3.5 backdrop-blur-md">
      {/* Top row: controls bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5">
        <div className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded-full animate-pulse shadow-[0_0_8px_currentColor]"
            style={{ color: palette.primary, backgroundColor: palette.primary }}
          />
          <span className="text-[13px] font-semibold tracking-wide text-white">
            NÚCLEO HOLOGRÁFICO
          </span>
          <span
            className="rounded px-1.5 py-0.5 text-[10px] font-medium tracking-wider uppercase"
            style={{
              backgroundColor: palette.bgAccent,
              color: palette.primary,
              borderColor: palette.glow,
            }}
          >
            {STATE_CONFIGS[visualState]?.label || visualState}
          </span>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-2">
          {/* Mic Button */}
          <button
            type="button"
            onClick={onToggleMic}
            title={isMicActive ? 'Desativar microfone' : 'Ativar microfone'}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11.5px] font-medium transition-all ${
              isMicActive
                ? 'bg-danger text-white shadow-[0_0_12px_rgba(255,46,85,0.4)]'
                : 'border border-white/10 bg-white/5 text-white/80 hover:bg-white/10'
            }`}
          >
            {isMicActive ? <IconMicrophone className="h-3.5 w-3.5" /> : <IconMicrophoneOff className="h-3.5 w-3.5" />}
            <span>{isMicActive ? 'Ouvindo' : 'Microfone'}</span>
          </button>

          {/* Voice Piper Test Button */}
          <button
            type="button"
            disabled={voiceTesting}
            onClick={onTriggerVoiceTest}
            title="Testar voz neural Piper Razo"
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11.5px] font-medium text-white/90 transition-all hover:border-accent hover:bg-white/10 active:scale-95 disabled:opacity-50"
            style={{ borderColor: palette.primary }}
          >
            <IconVolume className="h-3.5 w-3.5" style={{ color: palette.primary }} />
            <span>{voiceTesting ? 'Sintetizando...' : 'Voz Razo'}</span>
          </button>
        </div>
      </div>

      {voiceTestStatus && (
        <div className="rounded-lg bg-black/60 px-3 py-1.5 text-[11px] text-white/80 border border-white/5 flex items-center gap-2">
          <IconSparkles className="h-3 w-3 shrink-0" style={{ color: palette.primary }} />
          <span>{voiceTestStatus}</span>
        </div>
      )}

      {/* Palettes selection */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-[11px] text-white/60">
          <span className="flex items-center gap-1">
            <IconPalette className="h-3 w-3" /> Paleta de Cor
          </span>
          <span className="font-mono text-white/80">{palette.name}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(PALETTES) as HologramPaletteId[]).map((pId) => {
            const p = PALETTES[pId]
            const active = pId === paletteId
            return (
              <button
                key={pId}
                type="button"
                onClick={() => onSelectPalette(pId)}
                className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-[10.5px] transition-all ${
                  active
                    ? 'font-medium text-white shadow-sm ring-1 ring-white/40'
                    : 'bg-white/5 text-white/70 hover:bg-white/10'
                }`}
                style={{
                  backgroundColor: active ? p.bgAccent : undefined,
                  borderLeft: `3px solid ${p.primary}`,
                }}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: p.primary, boxShadow: active ? `0 0 6px ${p.primary}` : undefined }}
                />
                <span>{p.name.replace('MAXX ', '')}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* State simulator / inspector bar */}
      <div className="flex flex-col gap-1.5 border-t border-white/10 pt-2">
        <div className="flex items-center justify-between text-[11px] text-white/60">
          <span className="flex items-center gap-1">
            <IconPlayerPlay className="h-3 w-3" /> Estados Inteligentes (10 Estados Reais)
          </span>
          <span className="text-[10px] text-white/40">Clique para inspecionar</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {allStates.map((st) => {
            const cfg = STATE_CONFIGS[st]
            const active = st === visualState
            return (
              <button
                key={st}
                type="button"
                onClick={() => onSelectState(st)}
                className={`rounded px-1.5 py-0.5 text-[10px] transition-all ${
                  active
                    ? 'font-semibold text-white shadow-sm'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                }`}
                style={{
                  backgroundColor: active ? cfg.color : undefined,
                  boxShadow: active ? `0 0 8px ${cfg.color}88` : undefined,
                }}
              >
                {cfg.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Performance Tiers */}
      <div className="flex items-center justify-between border-t border-white/10 pt-2 text-[11px] text-white/60">
        <span className="flex items-center gap-1">
          <IconCpu className="h-3 w-3" /> Desempenho (Notebook)
        </span>
        <div className="flex items-center rounded-lg border border-white/10 bg-black/40 p-0.5">
          {(['high', 'balanced', 'eco', 'compatibility'] as PerformanceTier[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onSelectTier(t)}
              className={`rounded px-2 py-0.5 text-[10px] font-medium transition-all ${
                tier === t ? 'bg-white/20 text-white shadow' : 'text-white/50 hover:text-white'
              }`}
            >
              {t === 'high' ? 'Alto 3D' : t === 'balanced' ? 'Equilibrado' : t === 'eco' ? 'Eco' : '2D'}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
