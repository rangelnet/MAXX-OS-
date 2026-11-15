import { useStore } from '@nanostores/react'
import {
  IconArrowsExchange,
  IconCamera,
  IconCheck,
  IconChevronDown,
  IconDeviceDesktop,
  IconEdit,
  IconLock,
  IconLogout,
  IconSettings,
  IconUser,
  IconUserPlus,
  IconUsers,
} from '@tabler/icons-react'
import { useEffect, useRef, useState } from 'react'
import { cn } from '../../lib/cn.ts'
import {
  $currentUser,
  $profiles,
  lockSession,
  logout,
  openProfileDialog,
  switchUser,
  type UserProfile,
} from '../../store/user-profiles.ts'
import { showPage } from '../../store/windows.ts'

export interface UserProfileMenuProps {
  collapsed?: boolean
  className?: string
}

export function UserProfileMenu({ collapsed = false, className = '' }: UserProfileMenuProps) {
  const currentUser = useStore($currentUser)
  const profiles = useStore($profiles)
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close when clicking outside
  useEffect(() => {
    if (!open) return
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    window.addEventListener('mousedown', handleClickOutside)
    return () => window.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  if (!currentUser) return null

  return (
    <div ref={menuRef} className={cn('relative w-full', className)}>
      {/* 
        NOVO BLOCO DE PERFIL DO USUÁRIO NO MAXX OS
        Substitui integralmente o antigo bloco do Hermes (Foto, Nome 'Hermes' e Tagline).
        Apresenta:
        1. Foto personalizada do usuário
        2. Nome completo
        3. Indicador de sessão ativa
        4. Seta para abrir o menu de perfis
      */}
      <button
        id="btn-user-profile-menu"
        type="button"
        aria-label={`Perfil de ${currentUser.displayName}`}
        onClick={() => setOpen(!open)}
        className={cn(
          'group relative flex w-full text-left transition-all outline-none select-none',
          'rounded-2xl border border-transparent hover:border-line/40 hover:bg-white/8 active:scale-[0.98]',
          open && 'border-accent/40 bg-white/10 ring-1 ring-accent/30 shadow-lg',
          collapsed ? 'items-center justify-center p-1.5' : 'flex-col p-2.5'
        )}
        title={collapsed ? `${currentUser.displayName} — Perfis do MAXX OS` : undefined}
      >
        {collapsed ? (
          /* Modo Recolhido: Avatar central com badge de sessão ativa */
          <div className="relative shrink-0">
            <div className="size-10 rounded-2xl overflow-hidden border border-line bg-surface/80 shadow-md">
              {currentUser.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.displayName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center font-bold text-fg bg-accent/20 text-base">
                  {currentUser.displayName[0]?.toUpperCase() || 'U'}
                </div>
              )}
            </div>
            {/* Indicador de sessão ativa (ponto verde luminoso) */}
            <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-surface bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)] animate-pulse" />
          </div>
        ) : (
          /* Modo Expandido: Foto, Nome, Sessão Ativa e Seta */
          <div className="w-full">
            {/* Top row: Avatar com Câmera e Seta / Chevron */}
            <div className="flex w-full items-center justify-between">
              {/* 1. Foto personalizada do usuário */}
              <div className="relative shrink-0">
                <div className="size-11 rounded-2xl overflow-hidden border border-line/80 bg-surface/80 shadow-md transition-transform group-hover:scale-105">
                  {currentUser.avatarUrl ? (
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.displayName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center font-bold text-fg bg-accent/20 text-lg">
                      {currentUser.displayName[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
                {/* Badge de câmera sobre a foto */}
                <div
                  className="absolute -bottom-1 -right-1 flex size-4 items-center justify-center rounded-full border border-line bg-surface-2 text-fg-3 shadow transition-colors group-hover:border-accent group-hover:text-accent"
                  title="Alterar foto de perfil"
                >
                  <IconCamera className="size-2.5" />
                </div>
              </div>

              {/* 4. Seta para abrir o menu de perfis */}
              <div className="flex size-7 items-center justify-center rounded-xl bg-white/5 text-fg-3 transition-all group-hover:bg-white/10 group-hover:text-fg">
                <IconChevronDown
                  className={cn(
                    'size-4 transition-transform duration-200',
                    open && 'rotate-180 text-accent'
                  )}
                />
              </div>
            </div>

            {/* 2. Nome completo do usuário */}
            <div className="mt-2.5 text-[15px] font-bold leading-tight tracking-tight text-fg truncate">
              {currentUser.displayName}
            </div>

            {/* 3. Indicador de sessão ativa */}
            <div className="mt-1 flex items-center gap-1.5 text-[11px] font-medium leading-none text-fg-3">
              <span className="flex size-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
              <span className="text-emerald-400 font-semibold">Sessão ativa</span>
              <span className="text-fg-4">•</span>
              <span className="truncate text-fg-3">@{currentUser.username}</span>
            </div>
          </div>
        )}
      </button>

      {/* 
        MENU FLUTUANTE DE PERFIS (POPOVER)
        Contém rigorosamente todas as 9 opções solicitadas pelo usuário:
        - Meu perfil
        - Trocar usuário
        - Adicionar usuário
        - Alterar foto
        - Editar nome
        - Alterar senha
        - Configurações pessoais
        - Bloquear sessão
        - Sair da conta
      */}
      {open && (
        <div
          id="popover-user-profiles"
          className={cn(
            'absolute z-50 w-72 rounded-2xl border border-line bg-surface/95 p-2 text-fg shadow-2xl backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150',
            collapsed ? 'left-14 top-0' : 'left-0 top-[calc(100%+8px)]'
          )}
          style={{
            boxShadow: '0 16px 40px -8px rgba(0, 0, 0, 0.6), 0 0 20px -2px var(--color-accent-soft)',
          }}
        >
          {/* Cabeçalho do Popover */}
          <div className="mb-2 flex items-center justify-between border-b border-line/60 px-2.5 py-1.5">
            <div className="flex items-center gap-2">
              <IconUsers className="size-4 text-accent" />
              <span className="text-[12.5px] font-bold tracking-tight text-fg">
                Perfis do MAXX OS
              </span>
            </div>
            <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold text-accent">
              {profiles.length} {profiles.length === 1 ? 'perfil' : 'perfis'}
            </span>
          </div>

          {/* Lista rápida de perfis cadastrados */}
          <div className="space-y-1 mb-2">
            {profiles.map((profile: UserProfile) => {
              const isActive = profile.id === currentUser.id

              return (
                <div
                  key={profile.id}
                  onClick={() => {
                    if (!isActive) {
                      void switchUser(profile.id)
                      setOpen(false)
                    }
                  }}
                  className={cn(
                    'group flex items-center justify-between rounded-xl px-2.5 py-2 text-[12px] font-medium transition-all select-none',
                    isActive
                      ? 'border border-accent/40 bg-accent/15 text-fg shadow-sm'
                      : 'hover:bg-white/8 text-fg-2 hover:text-fg cursor-pointer'
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="size-7 rounded-full overflow-hidden border border-line shrink-0">
                      {profile.avatarUrl ? (
                        <img
                          src={profile.avatarUrl}
                          alt={profile.displayName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center font-bold text-fg bg-accent/20 text-[10px]">
                          {profile.displayName[0]?.toUpperCase() || 'U'}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 truncate">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate font-semibold text-fg">
                          {profile.displayName}
                        </span>
                        {isActive && (
                          <span className="flex items-center gap-1 text-[10px] text-accent font-semibold">
                            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                            Ativo
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {isActive && (
                    <IconCheck className="size-4 text-accent shrink-0 ml-2" />
                  )}
                </div>
              )
            })}
          </div>

          {/* Divisor */}
          <div className="my-1.5 h-px bg-line/60" />

          {/* As 9 Ações do Sistema de Perfis */}
          <div className="space-y-0.5">
            {/* 1. Meu perfil */}
            <button
              id="btn-action-view-profile"
              type="button"
              onClick={() => {
                setOpen(false)
                openProfileDialog('view-profile')
              }}
              className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-[12px] font-medium text-fg-2 hover:bg-white/8 hover:text-fg transition-colors"
            >
              <IconUser className="size-4 text-accent" />
              <span>Meu perfil</span>
            </button>

            {/* 2. Trocar usuário */}
            <button
              id="btn-action-switch-user"
              type="button"
              onClick={() => {
                setOpen(false)
                lockSession()
              }}
              className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-[12px] font-medium text-fg-2 hover:bg-white/8 hover:text-fg transition-colors"
            >
              <IconArrowsExchange className="size-4 text-fg-3" />
              <span>Trocar usuário</span>
            </button>

            {/* 3. Adicionar usuário */}
            <button
              id="btn-add-profile"
              type="button"
              onClick={() => {
                setOpen(false)
                openProfileDialog('create')
              }}
              className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-[12px] font-medium text-fg-2 hover:bg-white/8 hover:text-fg transition-colors"
            >
              <IconUserPlus className="size-4 text-fg-3" />
              <span>Adicionar usuário</span>
            </button>

            {/* Divisor */}
            <div className="my-1 h-px bg-line/40" />

            {/* 4. Alterar foto */}
            <button
              id="btn-action-edit-photo"
              type="button"
              onClick={() => {
                setOpen(false)
                openProfileDialog('edit-photo')
              }}
              className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-[12px] text-fg-2 hover:bg-white/8 hover:text-fg transition-colors"
            >
              <IconCamera className="size-4 text-fg-3" />
              <span>Alterar foto</span>
            </button>

            {/* 5. Editar nome */}
            <button
              id="btn-action-edit-name"
              type="button"
              onClick={() => {
                setOpen(false)
                openProfileDialog('edit-name')
              }}
              className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-[12px] text-fg-2 hover:bg-white/8 hover:text-fg transition-colors"
            >
              <IconEdit className="size-4 text-fg-3" />
              <span>Editar nome</span>
            </button>

            {/* 6. Alterar senha */}
            <button
              id="btn-action-change-password"
              type="button"
              onClick={() => {
                setOpen(false)
                openProfileDialog('change-password')
              }}
              className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-[12px] text-fg-2 hover:bg-white/8 hover:text-fg transition-colors"
            >
              <IconLock className="size-4 text-fg-3" />
              <span>Alterar senha</span>
            </button>

            {/* Divisor */}
            <div className="my-1 h-px bg-line/40" />

            {/* 7. Configurações pessoais */}
            <button
              id="btn-action-personal-settings"
              type="button"
              onClick={() => {
                setOpen(false)
                showPage('settings')
              }}
              className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-[12px] text-fg-2 hover:bg-white/8 hover:text-fg transition-colors"
            >
              <IconSettings className="size-4 text-fg-3" />
              <span>Configurações pessoais</span>
            </button>

            {/* 8. Bloquear sessão */}
            <button
              id="btn-action-lock-session"
              type="button"
              onClick={() => {
                setOpen(false)
                lockSession()
              }}
              className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-[12px] text-fg-2 hover:bg-white/8 hover:text-fg transition-colors"
            >
              <IconDeviceDesktop className="size-4 text-fg-3" />
              <span>Bloquear sessão</span>
            </button>

            {/* 9. Sair da conta */}
            <button
              id="btn-action-logout"
              type="button"
              onClick={() => {
                setOpen(false)
                logout()
              }}
              className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-[12px] font-medium text-danger hover:bg-danger/10 transition-colors"
            >
              <IconLogout className="size-4 text-danger" />
              <span>Sair da conta</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
