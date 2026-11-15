import {
  IconArrowUp,
  IconBulb,
  IconCheck,
  IconChevronDown,
  IconChevronRight,
  IconCopy,
  IconPaperclip,
  IconRobot,
  IconUser,
} from '@tabler/icons-react'
import { useEffect, useRef, useState } from 'react'
import type { ChatState } from '../../lib/chat-model.ts'
import type { HologramPalette } from './types.ts'

interface ConversationStreamProps {
  chat: ChatState | null
  onSendMessage: (text: string) => void
  palette: HologramPalette
  isThinking: boolean
}

export function ConversationStream({
  chat,
  onSendMessage,
  palette,
  isThinking,
}: ConversationStreamProps) {
  const [inputText, setInputText] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [expandedReasoning, setExpandedReasoning] = useState<Record<string, boolean>>({})
  const scrollRef = useRef<HTMLDivElement | null>(null)

  // Auto-scroll on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [chat?.messages.length, chat?.streaming])

  const handleSend = () => {
    const text = inputText.trim()
    if (!text) return
    onSendMessage(text)
    setInputText('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
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

  const quickPrompts = [
    'Qual o status do MAXX OS e recursos do sistema?',
    'Resuma as memórias e contexto recente.',
    'Testar capacidade de execução de ferramentas locais.',
    'Verificar integração com o JARVIS e voz Piper.',
  ]

  const messages = chat?.messages ?? []

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-black/40 backdrop-blur-md">
      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 space-y-3.5 overflow-y-auto p-4 scrollbar-thin">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center p-6 text-white/50">
            <div
              className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 shadow-lg"
              style={{ backgroundColor: palette.bgAccent, color: palette.primary }}
            >
              <IconRobot className="h-6 w-6" />
            </div>
            <h3 className="text-[15px] font-medium text-white/90">MAXX IA Conectada</h3>
            <p className="mt-1 max-w-sm text-[12px] text-white/60">
              Pronta para coordenar o sistema, executar tarefas, pesquisar ferramentas e sintetizar respostas.
            </p>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg w-full">
              {quickPrompts.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => onSendMessage(p)}
                  className="rounded-lg border border-white/5 bg-white/5 p-2.5 text-left text-[11px] text-white/70 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white"
                >
                  <span className="font-semibold" style={{ color: palette.primary }}>
                    →{' '}
                  </span>
                  {p}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.role === 'user'
            const reasoning = msg.role === 'assistant' ? msg.reasoning : ''
            const hasReasoning = Boolean(reasoning && reasoning.trim())
            const isStreaming = msg.role === 'assistant' ? msg.streaming : false
            const text = msg.role === 'tool' ? (msg.summary || msg.resultText || `Ferramenta: ${msg.name}`) : msg.text
            const isExpanded = expandedReasoning[msg.id] ?? false

            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 text-[12.5px] leading-relaxed ${
                  isUser ? 'justify-end' : 'justify-start'
                }`}
              >
                {!isUser && (
                  <div
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 text-white shadow-sm"
                    style={{ backgroundColor: palette.bgAccent, color: palette.primary }}
                  >
                    <IconRobot className="h-4 w-4" />
                  </div>
                )}

                <div
                  className={`relative max-w-[82%] rounded-xl px-3.5 py-2.5 shadow-md ${
                    isUser
                      ? 'border border-white/15 bg-white/10 text-white font-medium ml-8'
                      : 'border border-white/10 bg-black/60 text-white/90 mr-8'
                  }`}
                  style={
                    isUser
                      ? {
                          borderRightColor: palette.primary,
                          borderRightWidth: '2px',
                        }
                      : undefined
                  }
                >
                  {/* Reasoning / Thinking toggle block */}
                  {hasReasoning && (
                    <div className="mb-2 rounded-lg border border-white/10 bg-black/40 p-2 text-[11px]">
                      <button
                        type="button"
                        onClick={() => toggleReasoning(msg.id)}
                        className="flex w-full items-center justify-between text-white/60 hover:text-white"
                      >
                        <span className="flex items-center gap-1 font-mono text-[10.5px]">
                          <IconBulb className="h-3 w-3 text-warn" />
                          Raciocínio Interno
                        </span>
                        {isExpanded ? (
                          <IconChevronDown className="h-3 w-3" />
                        ) : (
                          <IconChevronRight className="h-3 w-3" />
                        )}
                      </button>
                      {isExpanded && (
                        <div className="mt-1.5 whitespace-pre-wrap border-t border-white/5 pt-1.5 font-mono text-[10px] text-white/70">
                          {reasoning}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Main text content */}
                  <div className="whitespace-pre-wrap select-text">{text}</div>

                  {isStreaming && (
                    <span
                      className="ml-1 inline-block h-3 w-1.5 animate-pulse"
                      style={{ backgroundColor: palette.primary }}
                    />
                  )}

                  {/* Action buttons (copy) */}
                  {!isUser && text && (
                    <div className="mt-2 flex items-center justify-end gap-1.5 border-t border-white/5 pt-1.5 text-[10px] text-white/40">
                      <button
                        type="button"
                        onClick={() => handleCopy(msg.id, text)}
                        className="flex items-center gap-1 hover:text-white"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <IconCheck className="h-3 w-3 text-ok" /> Copiado
                          </>
                        ) : (
                          <>
                            <IconCopy className="h-3 w-3" /> Copiar
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/10 text-white/80 shadow-sm">
                    <IconUser className="h-4 w-4" />
                  </div>
                )}
              </div>
            )
          })
        )}

        {isThinking && (
          <div className="flex items-center gap-2 text-[11.5px] text-white/60 py-1 px-3">
            <div
              className="h-2 w-2 rounded-full animate-ping"
              style={{ backgroundColor: palette.primary }}
            />
            <span style={{ color: palette.secondary }}>MAXX IA processando...</span>
          </div>
        )}
      </div>

      {/* Composer input area */}
      <div className="border-t border-white/10 bg-black/60 p-3">
        <div className="relative flex items-end gap-2 rounded-xl border border-white/15 bg-white/5 p-1.5 focus-within:border-accent">
          <button
            type="button"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/50 hover:bg-white/10 hover:text-white"
            title="Anexar arquivo"
          >
            <IconPaperclip className="h-4 w-4" />
          </button>

          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Converse ou comande a MAXX IA... (Enter para enviar, Shift+Enter para nova linha)"
            rows={1}
            className="max-h-24 min-h-[34px] flex-1 resize-none bg-transparent py-1.5 text-[13px] text-white placeholder-white/40 outline-none"
          />

          <button
            type="button"
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-medium text-white transition-all disabled:opacity-30 disabled:pointer-events-none shadow-md hover:scale-105 active:scale-95"
            style={{ backgroundColor: palette.primary }}
          >
            <IconArrowUp className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
