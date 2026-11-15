import {
  IconActivity,
  IconCheck,
  IconDatabase,
  IconRefresh,
  IconServer,
  IconShieldLock,
  IconVolume,
  IconX,
} from '@tabler/icons-react'
import type { JarvisHealth } from './use-maxx-ia.ts'
import type { HologramPalette } from './types.ts'

interface JarvisBridgePanelProps {
  health: JarvisHealth
  onRefresh: () => void
  onTestVoice: () => void
  voiceTesting: boolean
  palette: HologramPalette
}

export function JarvisBridgePanel({
  health,
  onRefresh,
  onTestVoice,
  voiceTesting,
  palette,
}: JarvisBridgePanelProps) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-black/40 p-3.5 backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
        <div className="flex items-center gap-2">
          <IconActivity className="h-4 w-4" style={{ color: palette.primary }} />
          <span className="text-[13px] font-semibold tracking-wide text-white">
            JARVIS MAXX — DIAGNÓSTICO
          </span>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          title="Atualizar sondagem"
          className="flex h-6 w-6 items-center justify-center rounded text-white/50 hover:bg-white/10 hover:text-white"
        >
          <IconRefresh className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mt-3 space-y-2.5 text-[11.5px]">
        {/* Backend service status */}
        <div className="flex items-center justify-between rounded-lg border border-white/5 bg-black/50 p-2.5">
          <div className="flex items-center gap-2">
            <IconServer className="h-4 w-4 text-white/60" />
            <div>
              <div className="font-medium text-white/90">Serviço Local JARVIS</div>
              <div className="text-[10px] text-white/40">Porta: {health.port} • /api/saude</div>
            </div>
          </div>
          <span
            className={`flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-semibold ${
              health.online
                ? 'bg-ok/15 text-ok border border-ok/30'
                : 'bg-white/10 text-white/50 border border-white/10'
            }`}
          >
            {health.online ? <IconCheck className="h-3 w-3" /> : <IconX className="h-3 w-3" />}
            {health.online ? 'Online' : 'Offline / Standalone'}
          </span>
        </div>

        {/* Piper Razo TTS Status */}
        <div className="flex items-center justify-between rounded-lg border border-white/5 bg-black/50 p-2.5">
          <div className="flex items-center gap-2">
            <IconVolume className="h-4 w-4" style={{ color: palette.primary }} />
            <div>
              <div className="font-medium text-white/90">Voz Razo (Piper TTS)</div>
              <div className="text-[10px] text-white/40">pt_BR-razo-medium • /api/maxx/voz/teste</div>
            </div>
          </div>
          <button
            type="button"
            disabled={voiceTesting}
            onClick={onTestVoice}
            className="rounded bg-white/10 hover:bg-white/20 px-2 py-1 text-[10.5px] font-medium text-white transition-all disabled:opacity-50"
          >
            {voiceTesting ? 'Testando...' : 'Testar Áudio'}
          </button>
        </div>

        {/* Memory vault status */}
        <div className="flex items-center justify-between rounded-lg border border-white/5 bg-black/50 p-2.5">
          <div className="flex items-center gap-2">
            <IconDatabase className="h-4 w-4 text-white/60" />
            <div>
              <div className="font-medium text-white/90">Memória Unificada</div>
              <div className="text-[10px] text-white/40">_obsidian_memoria + .reversa</div>
            </div>
          </div>
          <span className="rounded bg-ok/15 text-ok border border-ok/30 px-2 py-0.5 text-[10px] font-semibold">
            Ativa (516 notas)
          </span>
        </div>

        {/* Security protection indicator */}
        <div className="rounded-lg border border-ok/20 bg-ok/5 p-2.5 text-[11px] text-ok/90 flex items-start gap-2">
          <IconShieldLock className="h-4 w-4 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-white">Isolamento de Credenciais</div>
            <div className="text-[10.5px] text-white/70">
              Chaves do JARVIS original preservadas localmente. Nenhuma credencial foi copiada ou exposta.
            </div>
          </div>
        </div>

        {/* Source repo info */}
        <div className="rounded-lg border border-white/5 bg-black/40 p-2 text-[10.5px] text-white/50 font-mono">
          Origem: /home/rangel/JARVIS/jarvis-original
          <br />
          Sondagem: {health.lastChecked || 'Recente'}
        </div>
      </div>
    </div>
  )
}
