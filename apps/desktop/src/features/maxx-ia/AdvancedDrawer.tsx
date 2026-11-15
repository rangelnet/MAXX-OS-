import { useStore } from '@nanostores/react'
import {
  IconActivity,
  IconAdjustments,
  IconCheck,
  IconDeviceLaptop,
  IconPalette,
  IconSparkles,
  IconTool,
  IconX,
} from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { $prefs } from '../../store/backend.ts'
import { $themes, applyTheme, loadThemes } from '../../store/themes.ts'
import { JarvisBridgePanel } from './JarvisBridgePanel.tsx'
import { ToolApprovalPanel } from './ToolApprovalPanel.tsx'
import {
  type HologramPalette,
  type HologramPaletteId,
  type HologramVisualState,
  type PerformanceTier,
  STATE_CONFIGS,
} from './types.ts'
import type { JarvisHealth } from './use-maxx-ia.ts'

interface AdvancedDrawerProps {
  isOpen: boolean
  onClose: () => void
  palette: HologramPalette
  paletteId?: HologramPaletteId
  onSelectPalette?: (id: HologramPaletteId) => void
  visualState: HologramVisualState
  onSelectState: (state: HologramVisualState) => void
  tier: PerformanceTier
  onSelectTier: (tier: PerformanceTier) => void
  activeTools: any[]
  jarvisHealth: JarvisHealth
  onCheckJarvis: () => void
  onTestVoice: () => void
  voiceTesting: boolean
}

export function AdvancedDrawer({
  isOpen,
  onClose,
  palette,
  visualState,
  onSelectState,
  tier,
  onSelectTier,
  activeTools,
  jarvisHealth,
  onCheckJarvis,
  onTestVoice,
  voiceTesting,
}: AdvancedDrawerProps) {
  const [activeTab, setActiveTab] = useState<'themes' | 'tools' | 'jarvis' | 'diagnostics'>('themes')
  const prefs = useStore($prefs)
  const themes = useStore($themes)
  const currentTheme = prefs.themeName ?? `herald-${prefs.theme}`

  useEffect(() => {
    void loadThemes()
  }, [])

  if (!isOpen) return null

  const handleSelectTheme = async (themeName: string) => {
    try {
      await applyTheme(themeName)
    } catch (e) {
      console.error('Failed to apply theme:', e)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm transition-all select-none">
      <div className="glass-card flex h-full w-full max-w-md flex-col border-l border-line p-5 shadow-2xl animate-in slide-in-from-right duration-200 overflow-hidden">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-line pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-line bg-surface/50 text-accent">
              <IconAdjustments className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-[14px] font-bold tracking-tight text-fg">Diagnóstico & Temas</h2>
              <p className="text-[11px] text-fg-3">Motor oficial de temas do MAXX OS</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-line bg-surface/50 text-fg-2 hover:bg-surface-2 transition-colors"
          >
            <IconX className="h-4 w-4" />
          </button>
        </div>

        {/* Tab buttons */}
        <div className="my-3 flex rounded-xl border border-line bg-surface/40 p-1 text-[11px] font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('themes')}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 transition-all ${
              activeTab === 'themes'
                ? 'bg-surface-3 text-fg shadow border border-line'
                : 'text-fg-3 hover:text-fg'
            }`}
          >
            <IconPalette className="h-3.5 w-3.5" />
            <span>Temas OS</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('diagnostics')}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 transition-all ${
              activeTab === 'diagnostics'
                ? 'bg-surface-3 text-fg shadow border border-line'
                : 'text-fg-3 hover:text-fg'
            }`}
          >
            <IconSparkles className="h-3.5 w-3.5" />
            <span>Simulação</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tools')}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 transition-all ${
              activeTab === 'tools'
                ? 'bg-surface-3 text-fg shadow border border-line'
                : 'text-fg-3 hover:text-fg'
            }`}
          >
            <IconTool className="h-3.5 w-3.5" />
            <span>Ferramentas</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('jarvis')}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 transition-all ${
              activeTab === 'jarvis'
                ? 'bg-surface-3 text-fg shadow border border-line'
                : 'text-fg-3 hover:text-fg'
            }`}
          >
            <IconActivity className="h-3.5 w-3.5" />
            <span>JARVIS</span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {activeTab === 'themes' && (
            <div className="space-y-4">
              <div>
                <label className="text-[12px] font-semibold text-fg flex items-center justify-between">
                  <span>Temas Oficiais do Sistema</span>
                  <span className="text-[11px] font-medium text-accent">
                    {themes.find((t) => t.name === currentTheme)?.label ?? prefs.theme}
                  </span>
                </label>
                <p className="text-[11px] text-fg-3 mt-0.5">
                  Ao trocar o tema, o MAXX OS, os painéis e o holograma se adaptam automaticamente.
                </p>

                <div className="mt-3 grid grid-cols-1 gap-2">
                  {themes.map((theme) => {
                    const isSelected =
                      theme.name === currentTheme ||
                      theme.name === prefs.themeName ||
                      (theme.name === 'herald-ocean' && !prefs.themeName && prefs.theme === 'ocean')

                    return (
                      <button
                        key={theme.name}
                        type="button"
                        onClick={() => void handleSelectTheme(theme.name)}
                        className={`flex items-center justify-between rounded-xl border p-2.5 text-left transition-all ${
                          isSelected
                            ? 'border-accent bg-surface-3 shadow-md'
                            : 'border-line bg-surface/30 hover:bg-surface-2'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {/* Mini theme color swatch */}
                          <span
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-line shadow-sm"
                            style={{ backgroundColor: theme.colors.bg }}
                          >
                            <span
                              className="h-3.5 w-3.5 rounded-full"
                              style={{
                                backgroundColor: theme.colors.accent,
                                boxShadow: `0 0 8px ${theme.colors.accent}`,
                              }}
                            />
                          </span>
                          <div>
                            <span className="block text-[12px] font-semibold text-fg">
                              {theme.label}
                            </span>
                            <span className="block text-[10.5px] text-fg-3 truncate max-w-[220px]">
                              {theme.description}
                            </span>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-accent-fg shadow">
                            <IconCheck className="h-3 w-3" />
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Hardware Performance Tier */}
              <div className="border-t border-line pt-3">
                <label className="text-[12px] font-semibold text-fg flex items-center gap-1.5">
                  <IconDeviceLaptop className="h-3.5 w-3.5 text-fg-3" />
                  <span>Modo de Desempenho (Notebook)</span>
                </label>
                <p className="text-[11px] text-fg-3 mt-0.5">
                  Ajuste a densidade do holograma neural para o seu hardware
                </p>
                <div className="mt-2.5 grid grid-cols-2 gap-2">
                  {(['high', 'balanced', 'eco', 'compatibility'] as PerformanceTier[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => onSelectTier(t)}
                      className={`rounded-xl border py-2 px-2 text-center text-[11px] font-medium transition-all ${
                        tier === t
                          ? 'border-accent bg-surface-3 text-fg shadow'
                          : 'border-line bg-surface/30 text-fg-3 hover:text-fg'
                      }`}
                    >
                      {t === 'high'
                        ? 'Alto (3D Full)'
                        : t === 'balanced'
                        ? 'Equilibrado'
                        : t === 'eco'
                        ? 'Econômico'
                        : 'Compatibilidade 2D'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'diagnostics' && (
            <div className="space-y-3">
              <div className="rounded-xl border border-line bg-surface/30 p-3">
                <h4 className="text-[11.5px] font-semibold text-fg">
                  Simulador de Estados Inteligentes
                </h4>
                <p className="mt-0.5 text-[10.5px] text-fg-3">
                  No modo operacional, os estados reagem automaticamente aos eventos do sistema. Use os botões abaixo para inspecionar os efeitos visuais.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-1.5">
                {(Object.keys(STATE_CONFIGS) as HologramVisualState[]).map((state) => {
                  const cfg = STATE_CONFIGS[state]
                  const isSelected = visualState === state
                  return (
                    <button
                      key={state}
                      type="button"
                      onClick={() => onSelectState(state)}
                      className={`flex items-center justify-between rounded-xl border px-3 py-2 text-left transition-all ${
                        isSelected
                          ? 'border-accent bg-surface-3 shadow'
                          : 'border-line bg-surface/20 hover:bg-surface-2'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: cfg.color }}
                        />
                        <span className="text-[11.5px] font-medium text-fg">{cfg.label}</span>
                      </div>
                      <span className="text-[10px] text-fg-4">{cfg.description}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {activeTab === 'tools' && (
            <ToolApprovalPanel
              palette={palette}
              activeTools={activeTools}
            />
          )}

          {activeTab === 'jarvis' && (
            <JarvisBridgePanel
              health={jarvisHealth}
              onRefresh={onCheckJarvis}
              onTestVoice={onTestVoice}
              voiceTesting={voiceTesting}
              palette={palette}
            />
          )}
        </div>
      </div>
    </div>
  )
}
