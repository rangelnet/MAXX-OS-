// @vitest-environment happy-dom
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { $isSessionLocked } from '../../store/user-profiles.ts'
import { LockScreen } from './LockScreen.tsx'
import { UserProfileMenu } from './UserProfileMenu.tsx'

vi.hoisted(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })
})

let root: Root | null = null
let container: HTMLElement | null = null

async function renderComponent(element: React.ReactElement): Promise<HTMLElement> {
  const host = document.createElement('div')
  document.body.append(host)
  container = host
  root = createRoot(host)
  await act(async () => root?.render(element))
  return host
}

describe('UserProfileMenu and LockScreen Integration Tests', () => {
  beforeEach(() => {
    $isSessionLocked.set(false)
  })

  afterEach(() => {
    if (root) {
      act(() => root?.unmount())
      root = null
    }
    if (container) {
      container.remove()
      container = null
    }
  })

  it('renders user profile button with current user name and avatar', async () => {
    const host = await renderComponent(<UserProfileMenu />)
    const button = host.querySelector('#btn-user-profile-menu')
    expect(button).not.toBeNull()
    expect(button?.textContent).toContain('Rangel')
  })

  it('opens popover when profile button is clicked displaying profiles and actions', async () => {
    const host = await renderComponent(<UserProfileMenu />)
    const button = host.querySelector<HTMLButtonElement>('#btn-user-profile-menu')
    expect(button).not.toBeNull()

    // Popover closed initially
    expect(host.querySelector('#popover-user-profiles')).toBeNull()

    // Click to open popover
    await act(async () => {
      button?.click()
    })

    const popover = host.querySelector('#popover-user-profiles')
    expect(popover).not.toBeNull()
    expect(popover?.textContent).toContain('Perfis do MAXX OS')
    expect(popover?.textContent).toContain('Rangel')
    expect(popover?.textContent).toContain('Ativo')
    expect(popover?.textContent).toContain('Usuário 2')
    expect(popover?.textContent).toContain('Meu perfil')
    expect(popover?.textContent).toContain('Trocar usuário')
    expect(popover?.textContent).toContain('Adicionar usuário')
    expect(popover?.textContent).toContain('Alterar foto')
    expect(popover?.textContent).toContain('Editar nome')
    expect(popover?.textContent).toContain('Alterar senha')
    expect(popover?.textContent).toContain('Configurações pessoais')
    expect(popover?.textContent).toContain('Bloquear sessão')
    expect(popover?.textContent).toContain('Sair da conta')
  })

  it('triggers session lock when clicking Bloquear sessão', async () => {
    const host = await renderComponent(<UserProfileMenu />)
    const button = host.querySelector<HTMLButtonElement>('#btn-user-profile-menu')

    await act(async () => {
      button?.click()
    })

    const lockBtn = host.querySelector<HTMLButtonElement>('#btn-action-lock-session')
    expect(lockBtn).not.toBeNull()

    await act(async () => {
      lockBtn?.click()
    })

    expect($isSessionLocked.get()).toBe(true)
  })

  it('renders LockScreen when session is locked and allows unlocking', async () => {
    $isSessionLocked.set(true)
    const host = await renderComponent(<LockScreen />)

    const lockScreen = host.querySelector('#maxx-os-lock-screen')
    expect(lockScreen).not.toBeNull()
    expect(lockScreen?.textContent).toContain('Sessão Bloqueada')
    expect(lockScreen?.textContent).toContain('Rangel')

    // Find password input
    const input = host.querySelector<HTMLInputElement>('#input-lock-password')
    expect(input).not.toBeNull()
  })
})
