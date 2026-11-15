import { describe, expect, it, beforeEach } from 'vitest'
import {
  $currentUser,
  $isSessionLocked,
  $profiles,
  changePassword,
  createProfile,
  generateDefaultAvatar,
  hashPassword,
  lockSession,
  logout,
  switchUser,
  unlockSession,
  updateProfile,
  verifyUserPassword,
} from './user-profiles.ts'

describe('MAXX OS Multi-User Profiles & Authentication System', () => {
  beforeEach(() => {
    // Reset session lock
    $isSessionLocked.set(false)
  })

  it('initializes with seed profiles including Rangel as Admin', () => {
    const profiles = $profiles.get()
    expect(profiles.length).toBeGreaterThanOrEqual(2)

    const rangel = profiles.find(p => p.username === 'rangel')
    expect(rangel).toBeDefined()
    expect(rangel?.displayName).toBe('Rangel')
    expect(rangel?.role).toBe('admin')

    const user2 = profiles.find(p => p.username === 'usuario2')
    expect(user2).toBeDefined()
    expect(user2?.displayName).toBe('Usuário 2')
  })

  it('hashes passwords securely with PBKDF2/SHA-256 and unique salts', async () => {
    const salt1 = 'salt-alpha'
    const salt2 = 'salt-beta'
    const hash1 = await hashPassword('minhasenha', salt1)
    const hash2 = await hashPassword('minhasenha', salt2)

    expect(hash1).toBeDefined()
    expect(typeof hash1).toBe('string')
    expect(hash1.length).toBeGreaterThan(16)
    // Same password with different salts produces completely different hashes
    expect(hash1).not.toBe(hash2)
  })

  it('creates new user profile with validation and unique username', async () => {
    const res = await createProfile({
      username: 'maria',
      displayName: 'Maria Clara',
      password: 'senhaSegura123',
    })

    expect(res.ok).toBe(true)
    expect(res.profile).toBeDefined()
    expect(res.profile?.displayName).toBe('Maria Clara')
    expect(res.profile?.username).toBe('maria')

    // Duplicate username is rejected
    const dup = await createProfile({
      username: 'maria',
      displayName: 'Outra Maria',
    })
    expect(dup.ok).toBe(false)
    expect(dup.error).toContain('Já existe um perfil')
  })

  it('updates profile display name and avatar', () => {
    const profiles = $profiles.get()
    const target = profiles[0]

    const updated = updateProfile(target.id, {
      displayName: 'Rangel Atualizado',
      avatarUrl: generateDefaultAvatar('Rangel Atualizado'),
    })

    expect(updated.ok).toBe(true)
    const after = $profiles.get().find(p => p.id === target.id)
    expect(after?.displayName).toBe('Rangel Atualizado')
  })

  it('handles password change verifying current password and setting new salt', async () => {
    const res = await createProfile({
      username: 'pedro',
      displayName: 'Pedro',
      password: 'senhaAntiga123',
    })
    const pedroId = res.profile!.id

    // Invalid current password fails
    const failRes = await changePassword(pedroId, 'senhaErrada', 'novaSenha456')
    expect(failRes.ok).toBe(false)
    expect(failRes.error).toContain('incorreta')

    // Valid current password succeeds
    const okRes = await changePassword(pedroId, 'senhaAntiga123', 'novaSenha456')
    expect(okRes.ok).toBe(true)

    const updatedPedro = $profiles.get().find(p => p.id === pedroId)!
    const validWithNew = await verifyUserPassword(updatedPedro, 'novaSenha456')
    expect(validWithNew).toBe(true)

    const invalidWithOld = await verifyUserPassword(updatedPedro, 'senhaAntiga123')
    expect(invalidWithOld).toBe(false)
  })

  it('switches active user and restores personal session context', async () => {
    const profiles = $profiles.get()
    const user2 = profiles.find(p => p.username === 'usuario2')!

    const res = await switchUser(user2.id)
    expect(res.ok).toBe(true)
    expect($currentUser.get()?.id).toBe(user2.id)
    expect($currentUser.get()?.displayName).toBe('Usuário 2')
  })

  it('locks and unlocks session protecting private access', async () => {
    // Current user is logged in
    const user = $currentUser.get()!
    expect(user.displayName).toBe('Rangel')
    lockSession()
    expect($isSessionLocked.get()).toBe(true)

    // Unlock with invalid password fails
    const failUnlock = await unlockSession('senhaErrada')
    expect(failUnlock.ok).toBe(false)
    expect($isSessionLocked.get()).toBe(true)

    // Unlock with valid password succeeds
    // Use test seed password 'maxx'
    const okUnlock = await unlockSession('maxx')
    expect(okUnlock.ok).toBe(true)
    expect($isSessionLocked.get()).toBe(false)
  })

  it('logs out user clearing active session', () => {
    logout()
    expect($currentUser.get()).toBeNull()
    expect($isSessionLocked.get()).toBe(true)
  })
})
