import {
  IconAdjustments,
  IconArrowUp,
  IconBulb,
  IconCheck,
  IconChevronDown,
  IconChevronRight,
  IconCopy,
  IconCube,
  IconLink,
  IconMicrophone,
  IconPaperclip,
  IconSparkles,
  IconWaveSine,
  IconX,
} from '@tabler/icons-react'
import { useEffect, useRef, useState } from 'react'
import { useStore } from '@nanostores/react'
import { $currentUser } from '../../store/user-profiles.ts'
import { AdvancedDrawer } from './AdvancedDrawer.tsx'
import { HologramCanvas } from './HologramCanvas.tsx'
import { HologramPrototypeView } from './HologramPrototypeView.tsx'
import { SystemStatusSidebar } from './SystemStatusSidebar.tsx'
import { STATE_CONFIGS } from './types.ts'
import { useMaxxIa } from './use-maxx-ia.ts'

export function MaxxIaPage() {
  const {
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
  } = useMaxxIa()

  const currentUser = useStore($currentUser)
  const [inputText, setInputText] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [isPrototypeMode, setIsPrototypeMode] = useState(false)
  const [showConversation, setShowConversation] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [expandedReasoning, setExpandedReasoning] = useState<Record<string, boolean>>({})
  const chatScrollRef = useRef<HTMLDivElement | null>(null)

  const activeTools = chat?.messages?.filter((m): m is any => m.role === 'tool' && (m as any).running) ?? []
  const stateConfig = STATE_CONFIGS[visualState] ?? STATE_CONFIGS.ready
  const messages = chat?.messages ?? []

  // Auto show conversation if user interacts or messages exist
  useEffect(() => {
    if (messages.length > 0) {
      setShowConversation(true)
    }
  }, [messages.length])

  // Scroll to bottom when conversation updates
  useEffect(() => {
    if (showConversation && chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight
    }
  }, [messages.length, chat?.streaming, showConversation])

  const handleSend = () => {
    const text = inputText.trim()
    if (!text) return
    sendMessage(text)
    setInputText('')
    setShowConversation(true)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSend()
    }
  }

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const toggleReasoning = (id: string) => {
    setExpandedReasoning((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  if (isPrototypeMode) {
    return <HologramPrototypeView onClose={() => setIsPrototypeMode(false)} />
  }

  return (
    <div className="flex h-full w-full overflow-hidden p-3 gap-3 text-fg select-none">
      {/* ============================================================ */}
      {/* MAIN CENTER STAGE: The Futuristic AI Intelligence View       */}
      {/* ============================================================ */}
      <div className="glass-card relative flex flex-1 flex-col justify-between rounded-3xl p-5 shadow-2xl overflow-hidden min-w-0 transition-all">
        {/* Ambient atmospheric backdrop lighting (automatically inherits active OS theme) */}
        <div
          className="absolute inset-0 pointer-events-none opacity-25"
          style={{
            background: 'radial-gradient(circle at 50% 38%, var(--color-accent-soft) 0%, transparent 70%)',
          }}
        />

        {/* 1. TOP HEADER OF MAXX IA CARD */}
        <div className="relative z-10 flex items-center justify-between pb-2">
          {/* Title & Subtitle */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-line shadow-lg transition-transform hover:scale-105 bg-accent/15 text-accent shadow-[0_0_16px_var(--color-accent-soft)]">
              <IconWaveSine className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-[20px] font-black tracking-tight text-accent">
                  MAXX IA
                </h1>
                <span className="rounded-full px-2.5 py-0.5 text-[9.5px] font-semibold tracking-wider uppercase border border-accent/40 bg-accent/15 text-accent">
                  {palette.name}
                </span>
              </div>
              <p className="text-[12px] text-fg-3">
                {currentUser ? `Olá, ${currentUser.displayName} • ` : ''}Sua inteligência integrada, em evolução constante.
              </p>
            </div>
          </div>

          {/* Right Header: True Gateway Connection Badge & Settings Drawer Button */}
          <div className="flex items-center gap-2">
            {/* Real Connection Indicator */}
            <div className="flex items-center gap-2 rounded-xl border border-line bg-surface/50 px-3 py-1.5 text-[11px] backdrop-blur-md">
              <span
                className={`h-2 w-2 rounded-full ${
                  connection === 'open'
                    ? 'bg-ok shadow-[0_0_8px_#36e6a6]'
                    : 'bg-warn shadow-[0_0_6px_#f2c25e]'
                }`}
              />
              <span className="text-fg-2 font-medium">
                {connection === 'open' ? 'Hermes Conectado' : 'Aguardando Gateway'}
              </span>
            </div>

            {/* Advanced Settings & Diagnostics Drawer Trigger */}
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-line bg-surface/50 px-3 py-1.5 text-[11px] font-medium text-fg-2 hover:bg-surface-2 hover:text-fg transition-all active:scale-95 shadow-sm"
              title="Abrir painel de diagnósticos e galeria de temas do sistema"
            >
              <IconAdjustments className="h-3.5 w-3.5 text-accent" />
              <span className="hidden sm:inline">Temas & Ajustes</span>
            </button>

            {/* 3D Hologram Prototype Viewer Trigger */}
            <button
              id="btn-open-prototype"
              type="button"
              onClick={() => setIsPrototypeMode(true)}
              className="flex items-center gap-1.5 rounded-xl border border-line bg-surface/50 px-3 py-1.5 text-[11px] font-medium text-fg-2 hover:bg-surface-2 hover:text-fg transition-all active:scale-95 shadow-sm"
              title="Abrir ambiente isolado de validação 3D"
            >
              <IconCube className="h-3.5 w-3.5 text-accent" />
              <span className="hidden sm:inline">Protótipo 3D</span>
            </button>
          </div>
        </div>

        {/* 2. CENTRAL HERO: THE 3D HOLOGRAPHIC FACE & WAVEFORMS */}
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center overflow-hidden min-h-[300px]">
          {/* Conversation history overlay if active */}
          {showConversation && messages.length > 0 ? (
            <div className="absolute inset-x-4 top-2 bottom-16 z-20 flex flex-col rounded-2xl border border-line-strong bg-surface/85 p-4 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-line pb-2 mb-2">
                <span className="text-[12px] font-semibold text-fg flex items-center gap-1.5">
                  <IconSparkles className="h-3.5 w-3.5 text-accent" />
                  Fluxo da Conversa ({messages.length} mensagens)
                </span>
                <button
                  type="button"
                  onClick={() => setShowConversation(false)}
                  className="rounded-lg p-1 text-fg-3 hover:bg-surface-2 hover:text-fg"
                  title="Minimizar conversa para ver holograma completo"
                >
                  <IconX className="h-3.5 w-3.5" />
                </button>
              </div>

              <div ref={chatScrollRef} className="flex-1 space-y-3 overflow-y-auto pr-1">
                {messages.map((msg) => {
                  const isUser = msg.role === 'user'
                  const reasoning = msg.role === 'assistant' ? msg.reasoning : ''
                  const hasReasoning = Boolean(reasoning && reasoning.trim())
                  const text = msg.role === 'tool' ? (msg.summary || msg.resultText || `Ferramenta: ${msg.name}`) : msg.text
                  const isExpanded = expandedReasoning[msg.id] ?? false

                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-2 text-[12px] ${isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow ${
                          isUser
                            ? 'bg-accent/20 border border-accent/40 text-fg'
                            : 'glass-card border border-line text-fg'
                        }`}
                      >
                        {hasReasoning && (
                          <div className="mb-2 rounded-lg border border-line bg-surface/40 p-2 text-[10.5px]">
                            <button
                              type="button"
                              onClick={() => toggleReasoning(msg.id)}
                              className="flex w-full items-center justify-between text-fg-3 hover:text-fg"
                            >
                              <span className="flex items-center gap-1 font-mono">
                                <IconBulb className="h-3 w-3 text-warn" />
                                Raciocínio
                              </span>
                              {isExpanded ? <IconChevronDown className="h-3 w-3" /> : <IconChevronRight className="h-3 w-3" />}
                            </button>
                            {isExpanded && (
                              <div className="mt-1 whitespace-pre-wrap border-t border-line pt-1 font-mono text-[10px] text-fg-3">
                                {reasoning}
                              </div>
                            )}
                          </div>
                        )}
                        <div className="whitespace-pre-wrap select-text">{text}</div>
                        {!isUser && text && (
                          <div className="mt-1.5 flex justify-end">
                            <button
                              type="button"
                              onClick={() => handleCopy(msg.id, text)}
                              className="text-[10px] text-fg-4 hover:text-fg flex items-center gap-1"
                            >
                              {copiedId === msg.id ? <><IconCheck className="h-2.5 w-2.5 text-ok" /> Copiado</> : <><IconCopy className="h-2.5 w-2.5" /> Copiar</>}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : null}

          {/* 3D Hologram Face Canvas (Follows active theme colors) */}
          <div className="relative flex flex-1 items-center justify-center w-full min-h-[440px]">
            <HologramCanvas
              visualState={visualState}
              palette={palette}
              tier={tier}
              reducedMotion={reducedMotion}
              audioLevel={audioLevel}
              width={680}
              height={460}
              className="w-full max-w-[760px] h-[460px]"
            />
          </div>

          {/* FLOATING STATUS PILLS DIRECTLY UNDER THE FACE */}
          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            {/* Pill 1: Intelligence State */}
            <div
              className="flex items-center gap-2 rounded-full border border-line bg-surface/60 px-4 py-1.5 text-[11.5px] font-semibold backdrop-blur-xl shadow-lg transition-all"
              style={{
                boxShadow: '0 0 14px var(--color-accent-soft)',
              }}
            >
              {/* Mini animated equalizer waveform icon */}
              <div className="flex items-center gap-0.5">
                <span
                  className="inline-block w-1 rounded-full animate-bounce bg-accent"
                  style={{
                    height: '10px',
                    animationDuration: '600ms',
                  }}
                />
                <span
                  className="inline-block w-1 rounded-full animate-bounce bg-accent"
                  style={{
                    height: '14px',
                    animationDuration: '450ms',
                  }}
                />
                <span
                  className="inline-block w-1 rounded-full animate-bounce bg-accent"
                  style={{
                    height: '8px',
                    animationDuration: '750ms',
                  }}
                />
              </div>
              <span className="text-fg font-medium">MAXX IA</span>
              <span className="text-fg-4">•</span>
              <span style={{ color: stateConfig.color }}>
                {stateConfig.label}
              </span>
              {currentUser && (
                <>
                  <span className="text-fg-4">•</span>
                  <span className="text-fg-2 font-semibold">@{currentUser.username}</span>
                </>
              )}
            </div>

            {/* Pill 2: Connection Pill */}
            <div className="flex items-center gap-2 rounded-full border border-line bg-surface/60 px-4 py-1.5 text-[11.5px] font-medium backdrop-blur-xl shadow-lg">
              <IconLink className="h-3.5 w-3.5 text-fg-3" />
              <span
                className={`h-2 w-2 rounded-full ${
                  connection === 'open' ? 'bg-ok shadow-[0_0_8px_#36e6a6]' : 'bg-warn'
                }`}
              />
              <span className="text-fg-2">
                {connection === 'open' ? 'Hermes conectado' : 'Aguardando Gateway'}
              </span>
            </div>

            {/* Button to toggle conversation stream if messages exist */}
            {messages.length > 0 && !showConversation && (
              <button
                type="button"
                onClick={() => setShowConversation(true)}
                className="flex items-center gap-1.5 rounded-full border border-line bg-surface/60 px-3.5 py-1.5 text-[11px] font-medium text-accent hover:bg-surface-2 transition-all shadow"
              >
                <IconSparkles className="h-3 w-3" />
                <span>Ver Respostas ({messages.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* 3. FLOATING CONVERSATION INPUT BAR (Bottom of Center Stage) */}
        <div className="relative z-20 mt-4 flex justify-center">
          <div className="flex w-full max-w-2xl items-center gap-2 rounded-full border border-line-strong bg-surface/70 px-4 py-2 shadow-2xl backdrop-blur-2xl transition-all focus-within:border-accent focus-within:shadow-[0_0_24px_var(--color-accent-soft)]">
            {/* Sparkle icon */}
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-accent">
              <IconSparkles className="h-4 w-4" />
            </div>

            {/* Input field */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Converse com o MAXX IA..."
              className="flex-1 bg-transparent text-[13px] text-fg placeholder:text-fg-4 outline-none"
            />

            {/* Attachment clip */}
            <button
              type="button"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-fg-3 hover:bg-surface-2 hover:text-fg transition-colors"
              title="Anexar arquivo"
            >
              <IconPaperclip className="h-4 w-4" />
            </button>

            {/* Glowing Microphone Round Button */}
            <button
              type="button"
              onClick={toggleMic}
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all active:scale-95 ${
                isMicActive
                  ? 'bg-ok text-white shadow-[0_0_16px_#36e6a6] animate-pulse'
                  : 'bg-surface-2 text-fg-2 hover:bg-surface-3 hover:text-fg border border-line'
              }`}
              title={isMicActive ? 'Desativar microfone' : 'Ativar microfone'}
            >
              <IconMicrophone className="h-4 w-4" />
            </button>

            {/* Send Round Button */}
            <button
              type="button"
              onClick={handleSend}
              disabled={!inputText.trim()}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-medium bg-accent text-accent-fg shadow-lg transition-all disabled:opacity-30 disabled:pointer-events-none hover:scale-105 active:scale-95 shadow-[0_0_14px_var(--color-accent-soft)]"
              title="Enviar mensagem"
            >
              <IconArrowUp className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* RIGHT SIDEBAR: Áudio e Voz / Integração / Estado da IA       */}
      {/* ============================================================ */}
      <div className="flex shrink-0">
        <SystemStatusSidebar
          palette={palette}
          connection={connection}
          isMicActive={isMicActive}
          audioLevel={audioLevel}
          jarvisHealth={jarvisHealth}
          onTestVoice={triggerVoiceTest}
          voiceTesting={voiceTesting}
          voiceTestStatus={voiceTestStatus}
          onOpenAdvanced={() => setDrawerOpen(true)}
        />
      </div>

      {/* ============================================================ */}
      {/* COLLAPSIBLE DRAWER: Temas Oficiais do OS / Simulação / Ferramentas / JARVIS */}
      {/* ============================================================ */}
      <AdvancedDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        palette={palette}
        paletteId={paletteId}
        onSelectPalette={setPaletteId}
        visualState={visualState}
        onSelectState={setVisualState}
        tier={tier}
        onSelectTier={setTier}
        activeTools={activeTools}
        jarvisHealth={jarvisHealth}
        onCheckJarvis={checkJarvisHealth}
        onTestVoice={triggerVoiceTest}
        voiceTesting={voiceTesting}
      />
    </div>
  )
}
