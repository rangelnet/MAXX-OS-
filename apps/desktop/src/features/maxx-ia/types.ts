export type HologramPaletteId =
  | 'neon-orange'
  | 'cyan-holographic'
  | 'matrix-green'
  | 'purple-premium'
  | 'force-red'
  | 'executive-gold'
  | 'clean-cyan'
  | 'deep-dark'

export interface HologramPalette {
  id: HologramPaletteId
  name: string
  primary: string
  glow: string
  secondary: string
  bgAccent: string
  coreGlow: string
}

export const PALETTES: Record<HologramPaletteId, HologramPalette> = {
  'neon-orange': {
    id: 'neon-orange',
    name: 'MAXX Neon Orange',
    primary: '#FC5F16',
    glow: 'rgba(252, 95, 22, 0.65)',
    secondary: '#FF884D',
    bgAccent: 'rgba(252, 95, 22, 0.12)',
    coreGlow: 'rgba(252, 95, 22, 0.85)',
  },
  'cyan-holographic': {
    id: 'cyan-holographic',
    name: 'Azul Holográfico',
    primary: '#00F0FF',
    glow: 'rgba(0, 240, 255, 0.65)',
    secondary: '#38A2FF',
    bgAccent: 'rgba(0, 240, 255, 0.12)',
    coreGlow: 'rgba(0, 240, 255, 0.85)',
  },
  'matrix-green': {
    id: 'matrix-green',
    name: 'Verde Matrix',
    primary: '#00FF66',
    glow: 'rgba(0, 255, 102, 0.65)',
    secondary: '#00CC52',
    bgAccent: 'rgba(0, 255, 102, 0.12)',
    coreGlow: 'rgba(0, 255, 102, 0.85)',
  },
  'purple-premium': {
    id: 'purple-premium',
    name: 'Roxo Premium',
    primary: '#B829FF',
    glow: 'rgba(184, 41, 255, 0.65)',
    secondary: '#D06BFF',
    bgAccent: 'rgba(184, 41, 255, 0.12)',
    coreGlow: 'rgba(184, 41, 255, 0.85)',
  },
  'force-red': {
    id: 'force-red',
    name: 'Vermelho Force',
    primary: '#FF2E55',
    glow: 'rgba(255, 46, 85, 0.65)',
    secondary: '#FF6B85',
    bgAccent: 'rgba(255, 46, 85, 0.12)',
    coreGlow: 'rgba(255, 46, 85, 0.85)',
  },
  'executive-gold': {
    id: 'executive-gold',
    name: 'Dourado Executive',
    primary: '#FFB800',
    glow: 'rgba(255, 184, 0, 0.65)',
    secondary: '#FFD566',
    bgAccent: 'rgba(255, 184, 0, 0.12)',
    coreGlow: 'rgba(255, 184, 0, 0.85)',
  },
  'clean-cyan': {
    id: 'clean-cyan',
    name: 'Ciano Clean',
    primary: '#3AD4FF',
    glow: 'rgba(58, 212, 255, 0.65)',
    secondary: '#8CE4FF',
    bgAccent: 'rgba(58, 212, 255, 0.12)',
    coreGlow: 'rgba(58, 212, 255, 0.85)',
  },
  'deep-dark': {
    id: 'deep-dark',
    name: 'Escuro Grafite',
    primary: '#9AAECB',
    glow: 'rgba(154, 174, 203, 0.45)',
    secondary: '#CAD6E8',
    bgAccent: 'rgba(154, 174, 203, 0.08)',
    coreGlow: 'rgba(154, 174, 203, 0.6)',
  },
}

export type PerformanceTier = 'high' | 'balanced' | 'eco' | 'compatibility'

export type HologramVisualState =
  | 'ready'
  | 'listening'
  | 'transcribing'
  | 'thinking'
  | 'streaming'
  | 'speaking'
  | 'tool_running'
  | 'approval_pending'
  | 'succeeded'
  | 'failed'
  | 'cancelled'

export interface StateVisualConfig {
  label: string
  description: string
  color: string
  speedMultiplier: number
  pulseFrequency: number
  particleSpread: number
}

export const STATE_CONFIGS: Record<HologramVisualState, StateVisualConfig> = {
  ready: {
    label: 'Aguardando',
    description: 'Sistema pronto e em espera',
    color: '#38A2FF',
    speedMultiplier: 0.6,
    pulseFrequency: 0.8,
    particleSpread: 1.0,
  },
  listening: {
    label: 'Ouvindo',
    description: 'Captando voz do usuário',
    color: '#00F0FF',
    speedMultiplier: 1.2,
    pulseFrequency: 2.5,
    particleSpread: 1.3,
  },
  transcribing: {
    label: 'Transcrevendo',
    description: 'Convertendo áudio em intenção',
    color: '#70D6FF',
    speedMultiplier: 1.4,
    pulseFrequency: 1.8,
    particleSpread: 1.1,
  },
  thinking: {
    label: 'Pensando',
    description: 'Processamento neural e raciocínio',
    color: '#FC5F16',
    speedMultiplier: 2.2,
    pulseFrequency: 2.0,
    particleSpread: 1.4,
  },
  streaming: {
    label: 'Respondendo',
    description: 'Emitindo resposta em fluxo',
    color: '#FC5F16',
    speedMultiplier: 1.8,
    pulseFrequency: 1.5,
    particleSpread: 1.2,
  },
  speaking: {
    label: 'Falando',
    description: 'Síntese de voz Piper Razo ativa',
    color: '#FF884D',
    speedMultiplier: 1.5,
    pulseFrequency: 3.0,
    particleSpread: 1.3,
  },
  tool_running: {
    label: 'Executando ferramentas',
    description: 'Operação de sistema ou MCP em curso',
    color: '#B829FF',
    speedMultiplier: 2.0,
    pulseFrequency: 1.8,
    particleSpread: 1.5,
  },
  approval_pending: {
    label: 'Aguardando aprovação',
    description: 'Confirmação necessária para operação sensível',
    color: '#FFB800',
    speedMultiplier: 0.8,
    pulseFrequency: 2.8,
    particleSpread: 1.1,
  },
  succeeded: {
    label: 'Operação concluída',
    description: 'Ação executada com sucesso',
    color: '#00FF66',
    speedMultiplier: 0.7,
    pulseFrequency: 1.0,
    particleSpread: 1.0,
  },
  failed: {
    label: 'Erro',
    description: 'Falha ou exceção na execução',
    color: '#FF2E55',
    speedMultiplier: 0.4,
    pulseFrequency: 0.6,
    particleSpread: 1.6,
  },
  cancelled: {
    label: 'Cancelamento',
    description: 'Ação cancelada pelo usuário ou sistema',
    color: '#9AAECB',
    speedMultiplier: 0.3,
    pulseFrequency: 0.5,
    particleSpread: 0.9,
  },
}
