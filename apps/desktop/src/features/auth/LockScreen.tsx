import { useStore } from '@nanostores/react'
import {
  IconArrowRight,
  IconLock,
  IconPlus,
  IconUsers,
} from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import {
  $currentUser,
  $isSessionLocked,
  $profiles,
  openProfileDialog,
  switchUser,
  unlockSession,
  type UserProfile,
} from '../../store/user-profiles.ts'

export function LockScreen() {
  const isLocked = useStore($isSessionLocked)
  const currentUser = useStore($currentUser)
  const profiles = useStore($profiles)

  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(currentUser || profiles[0] || null)
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSwitchingMode, setIsSwitchingMode] = useState(!currentUser)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Keep time updated
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Sync selected user when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setSelectedUser(currentUser)
      setIsSwitchingMode(false)
    } else {
      setSelectedUser(profiles[0] || null)
      setIsSwitchingMode(true)
    }
  }, [currentUser, profiles])

  if (!isLocked) return null

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!selectedUser) return

    // If unlocking the currently logged user
    if (currentUser && selectedUser.id === currentUser.id) {
      const res = await unlockSession(password)
      if (!res.ok) {
        setErrorMessage(res.error || 'Senha incorreta.')
        return
      }
      setPassword('')
    } else {
      // Switching and logging into a different user
      const res = await switchUser(selectedUser.id, password)
      if (!res.ok) {
        setErrorMessage(res.error || 'Senha incorreta.')
        return
      }
      setPassword('')
    }
  }

  const formattedTime = currentTime.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
  const formattedDate = currentTime.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <div
      id="maxx-os-lock-screen"
      className="fixed inset-0 z-50 flex flex-col justify-between bg-bg/85 backdrop-blur-3xl text-fg select-none p-8 animate-in fade-in duration-200"
    >
      {/* Ambient Atmospheric Backdrop inheriting Theme Tokens */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          background: 'radial-gradient(circle at 50% 38%, var(--color-accent-soft) 0%, transparent 65%)',
        }}
      />

      {/* TOP BAR: Clock & Date & Status */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl border border-line bg-surface/50 text-accent font-bold text-[14px] shadow-lg">
            M
          </div>
          <div>
            <span className="text-[13px] font-bold tracking-wider uppercase text-accent">
              MAXX OS
            </span>
            <span className="text-fg-4 mx-2">•</span>
            <span className="text-[12px] text-fg-3">Sistema Multiusuário Seguro</span>
          </div>
        </div>

        {/* Digital Clock */}
        <div className="text-right">
          <div className="text-[28px] font-black tracking-tight leading-none text-fg font-mono">
            {formattedTime}
          </div>
          <div className="text-[11px] text-fg-3 capitalize mt-0.5">
            {formattedDate}
          </div>
        </div>
      </div>

      {/* CENTER STAGE: Profile Card or User Selection */}
      <div className="relative z-10 flex flex-1 items-center justify-center py-6">
        <div
          className="relative w-full max-w-sm rounded-3xl border border-line bg-surface/80 p-8 shadow-2xl backdrop-blur-2xl text-center"
          style={{
            boxShadow: '0 24px 64px -12px rgba(0, 0, 0, 0.6), 0 0 24px -2px var(--color-accent-soft)',
          }}
        >
          {isSwitchingMode ? (
            /* ============================================================ */
            /* MODE: SELECIONAR USUÁRIO                                     */
            /* ============================================================ */
            <div>
              <div className="mb-4 flex items-center justify-center gap-2 text-accent">
                <IconUsers className="size-5" />
                <h2 className="text-[16px] font-bold tracking-tight text-fg">
                  Selecione seu Perfil
                </h2>
              </div>

              {/* Profiles Grid */}
              <div className="space-y-2 mb-6 max-h-60 overflow-y-auto pr-1">
                {profiles.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setSelectedUser(p)
                      setIsSwitchingMode(false)
                      setPassword('')
                      setErrorMessage(null)
                    }}
                    className="flex w-full items-center gap-3 rounded-2xl border border-line bg-surface/40 p-2.5 text-left hover:border-accent hover:bg-accent/15 transition-all group"
                  >
                    <div className="size-11 rounded-full overflow-hidden border border-line shrink-0 group-hover:scale-105 transition-transform">
                      {p.avatarUrl ? (
                        <img src={p.avatarUrl} alt={p.displayName} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center font-bold text-fg bg-accent/20">
                          {p.displayName[0]?.toUpperCase() || 'U'}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1 truncate">
                      <div className="text-[13.5px] font-semibold text-fg truncate">
                        {p.displayName}
                      </div>
                      <div className="text-[11px] text-fg-3 truncate">
                        @{p.username} • {p.role === 'admin' ? 'Administrador' : 'Usuário'}
                      </div>
                    </div>
                    <IconArrowRight className="size-4 text-fg-4 group-hover:text-accent transition-colors shrink-0" />
                  </button>
                ))}
              </div>

              {/* Add New Profile button */}
              <button
                type="button"
                onClick={() => openProfileDialog('create')}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-line/80 p-2.5 text-[12px] font-medium text-fg-2 hover:border-accent hover:text-accent transition-all"
              >
                <IconPlus className="size-4" />
                <span>Adicionar Novo Perfil</span>
              </button>
            </div>
          ) : (
            /* ============================================================ */
            /* MODE: DESBLOQUEAR PERFIL SELECIONADO                         */
            /* ============================================================ */
            <div>
              {/* User Avatar */}
              <div className="mx-auto mb-4 flex justify-center">
                <div
                  className="size-24 rounded-full overflow-hidden border-2 border-accent shadow-xl bg-surface/50"
                  style={{
                    boxShadow: '0 0 20px var(--color-accent-soft)',
                  }}
                >
                  {selectedUser?.avatarUrl ? (
                    <img
                      src={selectedUser.avatarUrl}
                      alt={selectedUser.displayName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center font-bold text-2xl text-fg bg-accent/20">
                      {selectedUser?.displayName[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
              </div>

              {/* User Name & Status */}
              <h2 className="text-[19px] font-black tracking-tight text-fg">
                {selectedUser?.displayName}
              </h2>
              <p className="text-[11.5px] text-fg-3 flex items-center justify-center gap-1.5 mt-0.5 mb-5">
                <IconLock className="size-3 text-warn" />
                Sessão Bloqueada
              </p>

              {/* Error Message */}
              {errorMessage && (
                <div className="mb-4 rounded-xl border border-danger/40 bg-danger/10 px-3.5 py-2 text-[12px] text-danger animate-in fade-in">
                  {errorMessage}
                </div>
              )}

              {/* Password Input Form */}
              <form onSubmit={handleUnlock} className="space-y-3.5">
                <div className="relative">
                  <input
                    id="input-lock-password"
                    type="password"
                    autoFocus
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Digite sua senha..."
                    className="w-full rounded-2xl border border-line bg-surface/50 px-4 py-2.5 pr-11 text-[13px] text-fg outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 top-1.5 flex size-8 items-center justify-center rounded-xl bg-accent text-accent-fg shadow hover:bg-accent-strong transition-all"
                    title="Desbloquear"
                  >
                    <IconArrowRight className="size-4" />
                  </button>
                </div>

                <div className="pt-2 flex items-center justify-between text-[11.5px]">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSwitchingMode(true)
                      setErrorMessage(null)
                    }}
                    className="text-fg-3 hover:text-accent transition-colors flex items-center gap-1"
                  >
                    <IconUsers className="size-3.5" />
                    <span>Trocar Usuário</span>
                  </button>

                  <span className="text-fg-4 font-mono text-[10px]">
                    Enter para entrar
                  </span>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* FOOTER: Security Notice */}
      <div className="relative z-10 text-center text-[11px] text-fg-4">
        MAXX OS • Identidade, perfis e autenticação isolada com persistência local criptografada.
      </div>
    </div>
  )
}
