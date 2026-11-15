/**
 * Pure renderer-side conversation reducer.
 *
 * It consumes normalized events only. It does not open sockets, call IPC,
 * execute tools, access storage, or infer completion from an acknowledgement.
 */

export type ConversationStatus =
  | 'disconnected'
  | 'ready'
  | 'submitting'
  | 'accepted'
  | 'streaming'
  | 'tool_running'
  | 'approval_pending'
  | 'succeeded'
  | 'failed'
  | 'cancelled'

type EventBase = {
  sessionId: string
  occurredAt: string
}

export type ConversationEvent =
  | (EventBase & { kind: 'gateway-ready' })
  | (EventBase & { kind: 'connection-lost' })
  | (EventBase & { kind: 'turn-submitted'; turnId: string })
  | (EventBase & { kind: 'turn-accepted'; turnId: string })
  | (EventBase & { kind: 'assistant-delta'; turnId: string; text: string })
  | (EventBase & { kind: 'assistant-final'; turnId: string; text: string })
  | (EventBase & { kind: 'tool-start'; turnId: string; toolId: string })
  | (EventBase & { kind: 'tool-complete'; turnId: string; toolId: string })
  | (EventBase & { kind: 'approval-required'; turnId: string; approvalId: string })
  | (EventBase & { kind: 'turn-error'; turnId: string; message: string })
  | (EventBase & { kind: 'turn-cancelled'; turnId: string })

export type ConversationState = {
  status: ConversationStatus
  connected: boolean
  sessionId: string | null
  turnId: string | null
  answer: string
  activeTools: string[]
  approvalId: string | null
  error: string | null
  resultUnknown: boolean
}

const TERMINAL = new Set<ConversationStatus>(['succeeded', 'failed', 'cancelled'])
const TURN_ACTIVE = new Set<ConversationStatus>([
  'submitting',
  'accepted',
  'streaming',
  'tool_running',
  'approval_pending',
])

export function createConversationState(): ConversationState {
  return {
    status: 'disconnected',
    connected: false,
    sessionId: null,
    turnId: null,
    answer: '',
    activeTools: [],
    approvalId: null,
    error: null,
    resultUnknown: false,
  }
}

/** Reduce one normalized event. Uncorrelated or stale turn events are ignored. */
export function reduceConversationState(
  state: ConversationState,
  event: ConversationEvent,
): ConversationState {
  if (event.kind === 'gateway-ready') {
    const activeTurn = TURN_ACTIVE.has(state.status)
    return {
      ...state,
      status: activeTurn ? state.status : 'ready',
      connected: true,
      sessionId: event.sessionId,
      resultUnknown: activeTurn ? state.resultUnknown : false,
    }
  }

  if (state.sessionId !== event.sessionId) return state

  if (event.kind === 'connection-lost') {
    const activeTurn = TURN_ACTIVE.has(state.status)
    return {
      ...state,
      status: activeTurn ? state.status : 'disconnected',
      connected: false,
      resultUnknown: activeTurn,
    }
  }

  if (event.kind === 'turn-submitted') {
    const mayStartTurn = state.connected && (state.status === 'ready' || TERMINAL.has(state.status))
    if (!mayStartTurn) return state
    return {
      ...state,
      status: 'submitting',
      turnId: event.turnId,
      answer: '',
      activeTools: [],
      approvalId: null,
      error: null,
      resultUnknown: false,
    }
  }

  if (event.kind === 'turn-accepted') {
    const acceptedCurrentSubmission = state.connected
      && state.status === 'submitting'
      && state.turnId === event.turnId
    if (!acceptedCurrentSubmission) return state
    return {
      ...state,
      status: 'accepted',
      turnId: event.turnId,
      answer: state.answer,
      activeTools: state.activeTools,
      approvalId: null,
      error: null,
      resultUnknown: false,
    }
  }

  if (!event.turnId || event.turnId !== state.turnId || TERMINAL.has(state.status)) return state

  switch (event.kind) {
    case 'assistant-delta':
      if (!TURN_ACTIVE.has(state.status)) return state
      return { ...state, status: 'streaming', answer: state.answer + event.text, resultUnknown: false }

    case 'assistant-final':
      if (!TURN_ACTIVE.has(state.status)) return state
      return {
        ...state,
        status: 'succeeded',
        answer: event.text,
        activeTools: [],
        approvalId: null,
        error: null,
        resultUnknown: false,
      }

    case 'tool-start':
      if (!TURN_ACTIVE.has(state.status)) return state
      return {
        ...state,
        status: 'tool_running',
        activeTools: state.activeTools.includes(event.toolId)
          ? state.activeTools
          : [...state.activeTools, event.toolId],
      }

    case 'tool-complete': {
      if (!TURN_ACTIVE.has(state.status)) return state
      const activeTools = state.activeTools.filter((toolId) => toolId !== event.toolId)
      return {
        ...state,
        status: activeTools.length ? 'tool_running' : state.answer ? 'streaming' : 'accepted',
        activeTools,
      }
    }

    case 'approval-required':
      if (!TURN_ACTIVE.has(state.status)) return state
      return { ...state, status: 'approval_pending', approvalId: event.approvalId }

    case 'turn-error':
      if (!TURN_ACTIVE.has(state.status)) return state
      return {
        ...state,
        status: 'failed',
        error: event.message,
        activeTools: [],
        approvalId: null,
        resultUnknown: false,
      }

    case 'turn-cancelled':
      if (!TURN_ACTIVE.has(state.status)) return state
      return {
        ...state,
        status: 'cancelled',
        activeTools: [],
        approvalId: null,
        resultUnknown: false,
      }

    default:
      return state
  }
}
