import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  createConversationState,
  reduceConversationState,
  type ConversationEvent,
  type ConversationState,
} from '../conversation-state'

function readyState(): ConversationState {
  return reduceConversationState(createConversationState(), {
    kind: 'gateway-ready',
    sessionId: 'session-1',
    occurredAt: '2026-11-11T10:00:00.000Z',
  })
}

function acceptedState(): ConversationState {
  const submitting = reduceConversationState(readyState(), {
    kind: 'turn-submitted',
    sessionId: 'session-1',
    turnId: 'turn-1',
    occurredAt: '2026-11-11T10:00:00.500Z',
  })
  return reduceConversationState(submitting, {
    kind: 'turn-accepted',
    sessionId: 'session-1',
    turnId: 'turn-1',
    occurredAt: '2026-11-11T10:00:01.000Z',
  })
}

function event(overrides: Partial<ConversationEvent>): ConversationEvent {
  return {
    kind: 'assistant-delta',
    sessionId: 'session-1',
    turnId: 'turn-1',
    occurredAt: '2026-11-11T10:00:02.000Z',
    ...overrides,
  } as ConversationEvent
}

describe('MAXX IA conversation state contract', () => {
  it('moves to ready only after the gateway reports readiness', () => {
    expect(readyState()).toMatchObject({ status: 'ready', connected: true, sessionId: 'session-1' })
  })

  it('keeps prompt acceptance separate from a completed assistant turn', () => {
    const accepted = acceptedState()
    expect(accepted.status).toBe('accepted')

    const afterTool = reduceConversationState(accepted, event({ kind: 'tool-complete', toolId: 'search' }))
    expect(afterTool.status).toBe('accepted')

    const finished = reduceConversationState(afterTool, event({ kind: 'assistant-final', text: 'Resposta real' }))
    expect(finished).toMatchObject({ status: 'succeeded', answer: 'Resposta real' })
  })

  it('correlates the acceptance ACK with the submitted turn', () => {
    const submitting = reduceConversationState(readyState(), {
      kind: 'turn-submitted',
      sessionId: 'session-1',
      turnId: 'turn-submitted-1',
      occurredAt: '2026-11-11T10:00:01.000Z',
    })
    expect(submitting.status).toBe('submitting')

    const accepted = reduceConversationState(submitting, {
      kind: 'turn-accepted',
      sessionId: 'session-1',
      turnId: 'turn-submitted-1',
      occurredAt: '2026-11-11T10:00:02.000Z',
    })
    expect(accepted).toMatchObject({ status: 'accepted', turnId: 'turn-submitted-1' })
  })

  it('ignores acceptance ACKs without a matching local submission', () => {
    const ready = readyState()
    const uncorrelated = reduceConversationState(ready, {
      kind: 'turn-accepted',
      sessionId: 'session-1',
      turnId: 'unsolicited-turn',
      occurredAt: '2026-11-11T10:00:01.000Z',
    })
    expect(uncorrelated).toBe(ready)
  })

  it('accepts only correlated deltas and ignores events from an older turn', () => {
    const accepted = acceptedState()
    const stale = reduceConversationState(accepted, event({ turnId: 'turn-old', text: 'fora de ordem' }))
    expect(stale).toBe(accepted)

    const streaming = reduceConversationState(accepted, event({ text: 'Olá' }))
    expect(streaming).toMatchObject({ status: 'streaming', answer: 'Olá' })
  })

  it('tracks a tool without claiming that the conversation has succeeded', () => {
    const running = reduceConversationState(acceptedState(), event({ kind: 'tool-start', toolId: 'calendar' }))
    expect(running).toMatchObject({ status: 'tool_running', activeTools: ['calendar'] })

    const completed = reduceConversationState(running, event({ kind: 'tool-complete', toolId: 'calendar' }))
    expect(completed).toMatchObject({ status: 'accepted', activeTools: [] })
  })

  it('shows approval only after an explicit approval event', () => {
    const pending = reduceConversationState(acceptedState(), event({ kind: 'approval-required', approvalId: 'approval-1' }))
    expect(pending).toMatchObject({ status: 'approval_pending', approvalId: 'approval-1' })
  })

  it('separates confirmed failure and cancellation from accepted or disconnected states', () => {
    const failed = reduceConversationState(acceptedState(), event({ kind: 'turn-error', message: 'serviço indisponível' }))
    expect(failed).toMatchObject({ status: 'failed', error: 'serviço indisponível' })

    const cancelled = reduceConversationState(acceptedState(), event({ kind: 'turn-cancelled' }))
    expect(cancelled.status).toBe('cancelled')
  })

  it('marks a lost connection as uncertain without inventing failure or cancellation', () => {
    const uncertain = reduceConversationState(acceptedState(), event({ kind: 'connection-lost' }))
    expect(uncertain).toMatchObject({ status: 'accepted', connected: false, resultUnknown: true })
  })

  it('keeps the renderer state module free of Node and Electron capabilities', () => {
    const source = readFileSync(new URL('../conversation-state.ts', import.meta.url), 'utf8')
    expect(source).not.toMatch(/from\s+['"](?:node:|electron|fs|child_process)/)
    expect(source).not.toMatch(/\b(?:process|__dirname|require)\b/)
  })
})
