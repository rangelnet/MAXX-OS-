import { atom } from 'nanostores'
import { updatePrefs } from './backend.ts'
import { setActiveSpace } from './spaces.ts'

export interface UserPreferences {
  theme?: string
  accent?: 'blue' | 'violet' | 'ice'
  reduceMotion?: boolean
  language?: string
  voice?: string
  wallpaper?: string
  spaces?: Array<{ id: string; name: string; color: string }>
  activeSpace?: string
}

export interface UserProfile {
  id: string
  username: string
  displayName: string
  avatarUrl?: string
  passwordHash: string
  salt: string
  createdAt: number
  lastLoginAt: number
  role: 'admin' | 'user'
  preferences: UserPreferences
}

export type ProfileDialogType = 'create' | 'edit-photo' | 'edit-name' | 'change-password' | 'view-profile' | null

const STORAGE_KEY_PROFILES = 'maxx_os_user_profiles_v1'
const STORAGE_KEY_ACTIVE = 'maxx_os_active_user_id_v1'
const STORAGE_KEY_LOCKED = 'maxx_os_session_locked_v1'

// Default avatar generator as high-fidelity SVG Data URI
export function generateDefaultAvatar(name: string): string {
  const initial = (name.trim()[0] || 'U').toUpperCase()
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#3b82f6"/>
        <stop offset="50%" stop-color="#0ea5e9"/>
        <stop offset="100%" stop-color="#06b6d4"/>
      </linearGradient>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000" flood-opacity="0.3"/>
      </filter>
    </defs>
    <rect width="100" height="100" rx="50" fill="url(#grad)"/>
    <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="2"/>
    <text x="50" y="63" font-family="system-ui, -apple-system, sans-serif" font-size="42" font-weight="700" fill="#ffffff" text-anchor="middle" filter="url(#glow)">${initial}</text>
  </svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

export function generateUser2Avatar(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <defs>
      <linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ec4899"/>
        <stop offset="50%" stop-color="#8b5cf6"/>
        <stop offset="100%" stop-color="#6366f1"/>
      </linearGradient>
    </defs>
    <rect width="100" height="100" rx="50" fill="url(#g2)"/>
    <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="2"/>
    <text x="50" y="63" font-family="system-ui, -apple-system, sans-serif" font-size="42" font-weight="700" fill="#ffffff" text-anchor="middle">2</text>
  </svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

// Cryptographic Password Hashing with PBKDF2 & Salt
export async function hashPassword(password: string, salt: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    try {
      const encoder = new TextEncoder()
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey']
      )
      const key = await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: encoder.encode(salt),
          iterations: 100000,
          hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'HMAC', hash: 'SHA-256', length: 256 },
        true,
        ['sign']
      )
      const rawKey = await crypto.subtle.exportKey('raw', key)
      return Array.from(new Uint8Array(rawKey))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
    } catch {
      // fallback if subtle fails
    }
  }
  // Simple deterministic fallback for mock/test environments
  let hash = 0
  const combined = `${salt}:${password}`
  for (let i = 0; i < combined.length; i++) {
    hash = ((hash << 5) - hash) + combined.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash).toString(16).padStart(64, '0')
}

export function generateSalt(): string {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const bytes = new Uint8Array(16)
    crypto.getRandomValues(bytes)
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
  }
  return Math.random().toString(36).substring(2, 18)
}

// Initial Seed Profiles matching user specifications and screenshot
function createSeedProfiles(): UserProfile[] {
  const rangelSalt = 'salt-rangel-maxx-os-2026'
  const user2Salt = 'salt-user2-maxx-os-2026'
  
  return [
    {
      id: 'user-rangel',
      username: 'rangel',
      displayName: 'Rangel',
      avatarUrl: generateDefaultAvatar('Rangel'),
      passwordHash: '24fcd1ffb2a58da3bb5b300125e3c8bd1361199d8b6d61cfd74f78968747134e', // password 'maxx'
      salt: rangelSalt,
      createdAt: Date.now() - 30 * 86400000,
      lastLoginAt: Date.now(),
      role: 'admin',
      preferences: {
        theme: 'ocean',
        accent: 'blue',
        reduceMotion: false,
        language: 'pt-BR',
        spaces: [
          { id: 'personal', name: 'Pessoal', color: '#4d92ff' },
          { id: 'work', name: 'Trabalho', color: '#36e6a6' },
          { id: 'ideas', name: 'Ideias', color: '#b47cff' }
        ],
        activeSpace: 'personal'
      }
    },
    {
      id: 'user-2',
      username: 'usuario2',
      displayName: 'Usuário 2',
      avatarUrl: generateUser2Avatar(),
      passwordHash: 'bd7e13a6c0aca541fec348085335421a02260c0916a847d310b9397ba3c7a2e1', // password 'maxx'
      salt: user2Salt,
      createdAt: Date.now() - 15 * 86400000,
      lastLoginAt: Date.now() - 86400000,
      role: 'user',
      preferences: {
        theme: 'lagoon',
        accent: 'ice',
        reduceMotion: false,
        language: 'pt-BR',
        spaces: [
          { id: 'personal', name: 'Pessoal', color: '#06b6d4' },
          { id: 'studies', name: 'Estudos', color: '#f59e0b' }
        ],
        activeSpace: 'personal'
      }
    }
  ]
}

function loadInitialProfiles(): UserProfile[] {
  if (typeof localStorage === 'undefined') {
    return createSeedProfiles()
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROFILES)
    if (raw) {
      const parsed = JSON.parse(raw) as UserProfile[]
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    }
  } catch {
    // fallback
  }
  const defaults = createSeedProfiles()
  try {
    localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(defaults))
    localStorage.setItem(STORAGE_KEY_ACTIVE, defaults[0].id)
  } catch {
    // ignore
  }
  return defaults
}

function loadActiveUserId(profiles: UserProfile[]): string {
  if (typeof localStorage !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY_ACTIVE)
    if (saved && profiles.some(p => p.id === saved)) {
      return saved
    }
  }
  return profiles[0]?.id || 'user-rangel'
}

function loadLockedState(): boolean {
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem(STORAGE_KEY_LOCKED) === 'true'
  }
  return false
}

// Stores
const initialProfiles = loadInitialProfiles()
const initialActiveId = loadActiveUserId(initialProfiles)
const initialActiveUser = initialProfiles.find(p => p.id === initialActiveId) || initialProfiles[0] || null

export const $profiles = atom<UserProfile[]>(initialProfiles)
export const $currentUser = atom<UserProfile | null>(initialActiveUser)
export const $isSessionLocked = atom<boolean>(loadLockedState())
export const $isAuthenticated = atom<boolean>(Boolean(initialActiveUser))
export const $activeProfileDialog = atom<ProfileDialogType>(null)

// Persistence Helper
function persistProfiles(profiles: UserProfile[]) {
  $profiles.set(profiles)
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(profiles))
    } catch {
      // storage quota or disabled
    }
  }
}

function persistActiveUser(user: UserProfile | null) {
  $currentUser.set(user)
  $isAuthenticated.set(Boolean(user))
  if (typeof localStorage !== 'undefined') {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEY_ACTIVE, user.id)
      } else {
        localStorage.removeItem(STORAGE_KEY_ACTIVE)
      }
    } catch {
      // ignore
    }
  }
}

// Synchronize user preferences with OS state
export function applyUserPreferences(user: UserProfile): void {
  const prefs = user.preferences
  if (prefs.spaces && prefs.spaces.length > 0) {
    void updatePrefs({ spaces: prefs.spaces as any }).catch(() => {})
    if (prefs.activeSpace && typeof window !== 'undefined' && window.heraldOS?.prefs) {
      try {
        setActiveSpace(prefs.activeSpace)
      } catch {
        // ignore in mock environments
      }
    }
  }
  if (typeof window !== 'undefined' && window.heraldOS?.prefs) {
    if (prefs.theme || prefs.accent || typeof prefs.reduceMotion === 'boolean') {
      void updatePrefs({
        ...(prefs.theme ? { theme: prefs.theme as any } : {}),
        ...(prefs.accent ? { accent: prefs.accent } : {}),
        ...(typeof prefs.reduceMotion === 'boolean' ? { reduceMotion: prefs.reduceMotion } : {}),
      }).catch(() => {})
    }
  }
}

// Public API Actions
export function openProfileDialog(dialog: ProfileDialogType): void {
  $activeProfileDialog.set(dialog)
}

export function closeProfileDialog(): void {
  $activeProfileDialog.set(null)
}

export async function createProfile(data: {
  username: string
  displayName: string
  password?: string
  avatarUrl?: string
  role?: 'admin' | 'user'
}): Promise<{ ok: boolean; profile?: UserProfile; error?: string }> {
  const username = data.username.trim().toLowerCase().replace(/\s+/g, '_')
  const displayName = data.displayName.trim()
  
  if (!username) return { ok: false, error: 'Nome de usuário é obrigatório.' }
  if (!displayName) return { ok: false, error: 'Nome de exibição é obrigatório.' }

  const current = $profiles.get()
  if (current.some(p => p.username === username)) {
    return { ok: false, error: 'Já existe um perfil com este nome de usuário.' }
  }

  const salt = generateSalt()
  const passwordHash = await hashPassword(data.password || 'maxx', salt)
  const avatarUrl = data.avatarUrl || generateDefaultAvatar(displayName)

  const newProfile: UserProfile = {
    id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    username,
    displayName,
    avatarUrl,
    passwordHash,
    salt,
    createdAt: Date.now(),
    lastLoginAt: Date.now(),
    role: data.role || 'user',
    preferences: {
      theme: 'ocean',
      accent: 'blue',
      reduceMotion: false,
      language: 'pt-BR',
      spaces: [
        { id: 'personal', name: 'Pessoal', color: '#4d92ff' },
        { id: 'work', name: 'Trabalho', color: '#36e6a6' }
      ],
      activeSpace: 'personal'
    }
  }

  const updated = [...current, newProfile]
  persistProfiles(updated)
  return { ok: true, profile: newProfile }
}

export function updateProfile(
  id: string,
  patch: Partial<Pick<UserProfile, 'displayName' | 'avatarUrl' | 'preferences'>>
): { ok: boolean; error?: string } {
  const current = $profiles.get()
  const idx = current.findIndex(p => p.id === id)
  if (idx === -1) return { ok: false, error: 'Perfil não encontrado.' }

  const target = current[idx]
  const updatedProfile: UserProfile = {
    ...target,
    ...(patch.displayName ? { displayName: patch.displayName.trim() } : {}),
    ...(patch.avatarUrl ? { avatarUrl: patch.avatarUrl } : {}),
    ...(patch.preferences ? { preferences: { ...target.preferences, ...patch.preferences } } : {})
  }

  const updatedList = [...current]
  updatedList[idx] = updatedProfile
  persistProfiles(updatedList)

  if ($currentUser.get()?.id === id) {
    persistActiveUser(updatedProfile)
    if (patch.preferences) {
      applyUserPreferences(updatedProfile)
    }
  }

  return { ok: true }
}

export async function changePassword(
  id: string,
  currentPass: string,
  newPass: string
): Promise<{ ok: boolean; error?: string }> {
  if (!newPass || newPass.length < 3) {
    return { ok: false, error: 'A nova senha deve possuir ao menos 3 caracteres.' }
  }

  const current = $profiles.get()
  const target = current.find(p => p.id === id)
  if (!target) return { ok: false, error: 'Perfil não encontrado.' }

  // Verify current password
  const currentHash = await hashPassword(currentPass, target.salt)
  if (currentHash !== target.passwordHash) {
    return { ok: false, error: 'Senha atual incorreta.' }
  }

  // Derive new password hash with a fresh salt
  const newSalt = generateSalt()
  const newHash = await hashPassword(newPass, newSalt)

  const updatedList = current.map(p =>
    p.id === id ? { ...p, passwordHash: newHash, salt: newSalt } : p
  )
  persistProfiles(updatedList)
  return { ok: true }
}

export async function verifyUserPassword(profile: UserProfile, password: string): Promise<boolean> {
  const hash = await hashPassword(password, profile.salt)
  return hash === profile.passwordHash
}

export async function switchUser(
  targetUserId: string,
  password?: string
): Promise<{ ok: boolean; error?: string }> {
  const current = $profiles.get()
  const target = current.find(p => p.id === targetUserId)
  if (!target) return { ok: false, error: 'Perfil selecionado não existe.' }

  // If password is provided, verify it
  if (password !== undefined) {
    const valid = await verifyUserPassword(target, password)
    if (!valid) return { ok: false, error: 'Senha incorreta.' }
  }

  const updatedTarget = { ...target, lastLoginAt: Date.now() }
  const updatedList = current.map(p => (p.id === targetUserId ? updatedTarget : p))
  persistProfiles(updatedList)
  persistActiveUser(updatedTarget)

  $isSessionLocked.set(false)
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY_LOCKED)
  }

  applyUserPreferences(updatedTarget)
  return { ok: true }
}

export function lockSession(): void {
  $isSessionLocked.set(true)
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_LOCKED, 'true')
  }
}

export async function unlockSession(password: string): Promise<{ ok: boolean; error?: string }> {
  const user = $currentUser.get()
  if (!user) return { ok: false, error: 'Nenhum usuário ativo.' }

  const valid = await verifyUserPassword(user, password)
  if (!valid) return { ok: false, error: 'Senha incorreta.' }

  $isSessionLocked.set(false)
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY_LOCKED)
  }
  return { ok: true }
}

export function logout(): void {
  persistActiveUser(null)
  $isSessionLocked.set(true)
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_LOCKED, 'true')
  }
}

export function deleteProfile(id: string): { ok: boolean; error?: string } {
  const current = $profiles.get()
  const target = current.find(p => p.id === id)
  if (!target) return { ok: false, error: 'Perfil não encontrado.' }

  if (target.role === 'admin' && current.filter(p => p.role === 'admin').length <= 1) {
    return { ok: false, error: 'Não é possível excluir o único administrador do sistema.' }
  }

  const remaining = current.filter(p => p.id !== id)
  persistProfiles(remaining)

  if ($currentUser.get()?.id === id) {
    const nextUser = remaining[0] || null
    persistActiveUser(nextUser)
    if (nextUser) {
      applyUserPreferences(nextUser)
    }
  }

  return { ok: true }
}
