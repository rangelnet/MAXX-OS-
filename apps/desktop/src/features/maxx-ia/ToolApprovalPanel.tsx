import {
  IconAlertTriangle,
  IconCheck,
  IconClock,
  IconCpu,
  IconFlame,
  IconLock,
  IconShieldCheck,
  IconTool,
  IconX,
} from '@tabler/icons-react'
import { useState } from 'react'
import type { HologramPalette } from './types.ts'

export type SecurityTier = 'read' | 'act' | 'mutate' | 'destructive'

export interface ToolExecution {
  id: string
  name: string
  tier: SecurityTier
  params: string
  status: 'running' | 'completed' | 'failed' | 'pending_approval'
  startedAt: string
  result?: string
}

interface ToolApprovalPanelProps {
  palette: HologramPalette
  activeTools?: string[]
}

export function ToolApprovalPanel({ palette, activeTools = [] }: ToolApprovalPanelProps) {
  // Built-in mock/demo tool history showing system capabilities
  const [tools, setTools] = useState<ToolExecution[]>([
    {
      id: 'tool-1',
      name: 'hermes.sys.info',
      tier: 'read',
      params: '{"target": "system_resources", "metrics": ["cpu", "ram", "gpu"]}',
      status: 'completed',
      startedAt: '16:42:10',
      result: 'CPU: 14% | RAM: 5.4/16GB | GPU: SwiftShader (Fall-back seguro)',
    },
    {
      id: 'tool-2',
      name: 'maxx.jarvis.audio.probe',
      tier: 'act',
      params: '{"device": "default_mic", "sample_rate": 16000}',
      status: 'completed',
      startedAt: '16:42:12',
      result: 'Microfone detectado | Piper Razo TTS pronto via /api/maxx/voz/teste',
    },
    {
      id: 'tool-3',
      name: 'fs.workspace.status',
      tier: 'read',
      params: '{"path": "/home/rangel/Documentos/MAXX-OS", "depth": 1}',
      status: 'completed',
      startedAt: '16:42:15',
      result: 'MAXX OS workspace verificado: 1.758 arquivos rastreados',
    },
  ])

  const [pendingApproval, setPendingApproval] = useState<ToolExecution | null>(null)

  const handleApprove = () => {
    if (!pendingApproval) return
    setTools((prev) => [
      { ...pendingApproval, status: 'completed', result: 'Operação aprovada pelo usuário e executada.' },
      ...prev,
    ])
    setPendingApproval(null)
  }

  const handleDeny = () => {
    if (!pendingApproval) return
    setTools((prev) => [
      { ...pendingApproval, status: 'failed', result: 'Operação cancelada pelo usuário.' },
      ...prev,
    ])
    setPendingApproval(null)
  }

  const tierBadge = (tier: SecurityTier) => {
    switch (tier) {
      case 'read':
        return (
          <span className="rounded bg-ok/15 px-1.5 py-0.5 text-[10px] font-semibold text-ok border border-ok/30 flex items-center gap-1">
            <IconShieldCheck className="h-3 w-3" /> READ
          </span>
        )
      case 'act':
        return (
          <span className="rounded bg-progress/15 px-1.5 py-0.5 text-[10px] font-semibold text-progress border border-progress/30 flex items-center gap-1">
            <IconCpu className="h-3 w-3" /> ACT
          </span>
        )
      case 'mutate':
        return (
          <span className="rounded bg-warn/15 px-1.5 py-0.5 text-[10px] font-semibold text-warn border border-warn/30 flex items-center gap-1">
            <IconLock className="h-3 w-3" /> MUTATE
          </span>
        )
      case 'destructive':
        return (
          <span className="rounded bg-danger/15 px-1.5 py-0.5 text-[10px] font-semibold text-danger border border-danger/30 flex items-center gap-1">
            <IconFlame className="h-3 w-3" /> DESTRUCTIVE
          </span>
        )
    }
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-black/40 p-3.5 backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
        <div className="flex items-center gap-2">
          <IconTool className="h-4 w-4" style={{ color: palette.primary }} />
          <span className="text-[13px] font-semibold tracking-wide text-white">
            FERRAMENTAS & PERMISSÕES
          </span>
        </div>
        <span className="rounded bg-white/5 px-2 py-0.5 text-[10px] font-mono text-white/60">
          Tier Security: Ativo
        </span>
      </div>

      {/* Pending approval alert if any */}
      {pendingApproval && (
        <div className="my-3 rounded-xl border border-warn/40 bg-warn/10 p-3 shadow-lg animate-pulse">
          <div className="flex items-center gap-2 text-[12px] font-bold text-warn">
            <IconAlertTriangle className="h-4 w-4" />
            <span>Autorização Humana Necessária</span>
          </div>
          <div className="mt-1 font-mono text-[11px] text-white/90">
            {pendingApproval.name}
          </div>
          <div className="mt-1 text-[10.5px] text-white/70">
            Parâmetros: <code className="bg-black/40 px-1 py-0.5 rounded">{pendingApproval.params}</code>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={handleApprove}
              className="flex items-center gap-1 rounded-lg bg-ok px-3 py-1 text-[11px] font-semibold text-black hover:bg-ok/90"
            >
              <IconCheck className="h-3.5 w-3.5" /> Autorizar
            </button>
            <button
              type="button"
              onClick={handleDeny}
              className="flex items-center gap-1 rounded-lg border border-white/20 bg-white/5 px-3 py-1 text-[11px] font-semibold text-white/80 hover:bg-white/10"
            >
              <IconX className="h-3.5 w-3.5" /> Negar
            </button>
          </div>
        </div>
      )}

      {/* Active tools indicator */}
      {activeTools.length > 0 && (
        <div className="my-2 rounded-lg border border-accent/30 bg-accent/10 p-2 text-[11px] text-white">
          <span className="font-semibold text-accent">Em execução: </span>
          {activeTools.join(', ')}
        </div>
      )}

      {/* Tools execution list */}
      <div className="mt-2 flex-1 space-y-2 overflow-y-auto pr-1 scrollbar-thin">
        {tools.map((t) => (
          <div
            key={t.id}
            className="rounded-lg border border-white/5 bg-black/50 p-2.5 transition-all hover:border-white/15"
          >
            <div className="flex items-center justify-between gap-1">
              <span className="font-mono text-[11.5px] font-medium text-white/90">
                {t.name}
              </span>
              {tierBadge(t.tier)}
            </div>

            <div className="mt-1 flex items-center gap-2 font-mono text-[10px] text-white/40">
              <span className="flex items-center gap-0.5">
                <IconClock className="h-2.5 w-2.5" /> {t.startedAt}
              </span>
              <span>•</span>
              <span className="text-ok">Finalizado</span>
            </div>

            {t.result && (
              <div className="mt-1.5 rounded border border-white/5 bg-black/40 p-1.5 font-mono text-[10.5px] text-white/70">
                {t.result}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
