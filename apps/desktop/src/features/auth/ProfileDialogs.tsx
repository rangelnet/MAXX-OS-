import { useStore } from '@nanostores/react'
import {
  IconCamera,
  IconCheck,
  IconEdit,
  IconKey,
  IconLock,
  IconShieldCheck,
  IconUpload,
  IconUser,
  IconUserPlus,
  IconX,
} from '@tabler/icons-react'
import { useState } from 'react'
import {
  $activeProfileDialog,
  $currentUser,
  changePassword,
  closeProfileDialog,
  createProfile,
  generateDefaultAvatar,
  openProfileDialog,
  updateProfile,
} from '../../store/user-profiles.ts'

export function ProfileDialogs() {
  const activeDialog = useStore($activeProfileDialog)
  const currentUser = useStore($currentUser)

  // Form states
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!activeDialog) return null

  const handleClose = () => {
    setErrorMessage(null)
    setSuccessMessage(null)
    setPhotoPreview(null)
    setPassword('')
    setConfirmPassword('')
    setCurrentPassword('')
    setNewPassword('')
    closeProfileDialog()
  }

  // Handle Photo File Upload
  const handlePhotoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Por favor selecione um arquivo de imagem válido (PNG, JPG ou WebP).')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('A imagem deve ter no máximo 5MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setPhotoPreview(reader.result as string)
      setErrorMessage(null)
    }
    reader.readAsDataURL(file)
  }

  // Submit Create Profile
  const handleSubmitCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (password && password !== confirmPassword) {
      setErrorMessage('As senhas não coincidem.')
      return
    }

    setIsSubmitting(true)
    const res = await createProfile({
      username: username || displayName.toLowerCase().replace(/\s+/g, '_'),
      displayName,
      password: password || 'maxx',
      avatarUrl: photoPreview || generateDefaultAvatar(displayName),
    })
    setIsSubmitting(false)

    if (!res.ok) {
      setErrorMessage(res.error || 'Erro ao criar perfil.')
      return
    }

    handleClose()
  }

  // Submit Edit Name
  const handleSubmitName = (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) return

    if (!displayName.trim()) {
      setErrorMessage('O nome não pode estar vazio.')
      return
    }

    const res = updateProfile(currentUser.id, { displayName })
    if (!res.ok) {
      setErrorMessage(res.error || 'Erro ao atualizar nome.')
      return
    }

    handleClose()
  }

  // Submit Edit Photo
  const handleSubmitPhoto = (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser || !photoPreview) return

    const res = updateProfile(currentUser.id, { avatarUrl: photoPreview })
    if (!res.ok) {
      setErrorMessage(res.error || 'Erro ao salvar foto.')
      return
    }

    handleClose()
  }

  // Submit Change Password
  const handleSubmitPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) return
    setErrorMessage(null)

    if (newPassword !== confirmPassword) {
      setErrorMessage('A nova senha e a confirmação não coincidem.')
      return
    }

    setIsSubmitting(true)
    const res = await changePassword(currentUser.id, currentPassword, newPassword)
    setIsSubmitting(false)

    if (!res.ok) {
      setErrorMessage(res.error || 'Erro ao alterar senha.')
      return
    }

    setSuccessMessage('Senha alterada com sucesso!')
    setTimeout(() => {
      handleClose()
    }, 1200)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-md rounded-2xl border border-line bg-surface/95 p-6 shadow-2xl backdrop-blur-2xl text-fg"
        style={{
          boxShadow: '0 20px 48px -8px rgba(0, 0, 0, 0.6), 0 0 24px -2px var(--color-accent-soft)',
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 rounded-xl p-1.5 text-fg-3 hover:bg-surface-2 hover:text-fg transition-colors"
        >
          <IconX className="size-4" />
        </button>

        {/* 1. DIALOG: ADICIONAR PERFIL */}
        {activeDialog === 'create' && (
          <form onSubmit={handleSubmitCreate} className="space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-line">
              <div className="flex size-9 items-center justify-center rounded-xl bg-accent/20 text-accent">
                <IconUserPlus className="size-5" />
              </div>
              <div>
                <h3 className="text-[16px] font-bold tracking-tight">Criar Novo Perfil</h3>
                <p className="text-[12px] text-fg-3">Adicione um novo usuário ao MAXX OS</p>
              </div>
            </div>

            {errorMessage && (
              <div className="rounded-xl border border-danger/40 bg-danger/10 px-3.5 py-2 text-[12px] text-danger">
                {errorMessage}
              </div>
            )}

            <div>
              <label className="block text-[12px] font-medium text-fg-2 mb-1">Nome de Exibição</label>
              <input
                type="text"
                required
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="Ex: Maria Clara"
                className="w-full rounded-xl border border-line bg-surface/50 px-3.5 py-2 text-[13px] text-fg outline-none focus:border-accent focus:ring-1 focus:ring-accent"
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium text-fg-2 mb-1">Nome de Usuário (Identificador)</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Ex: mariaclara"
                className="w-full rounded-xl border border-line bg-surface/50 px-3.5 py-2 text-[13px] text-fg outline-none focus:border-accent focus:ring-1 focus:ring-accent"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-medium text-fg-2 mb-1">Senha</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Senha"
                  className="w-full rounded-xl border border-line bg-surface/50 px-3.5 py-2 text-[13px] text-fg outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-fg-2 mb-1">Confirmar Senha</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Confirmar"
                  className="w-full rounded-xl border border-line bg-surface/50 px-3.5 py-2 text-[13px] text-fg outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-xl border border-line px-4 py-2 text-[12.5px] font-medium text-fg-2 hover:bg-surface-2 hover:text-fg transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-accent px-5 py-2 text-[12.5px] font-semibold text-accent-fg shadow-lg shadow-accent/25 hover:bg-accent-strong transition-all"
              >
                {isSubmitting ? 'Criando...' : 'Criar Perfil'}
              </button>
            </div>
          </form>
        )}

        {/* 2. DIALOG: EDITAR FOTO */}
        {activeDialog === 'edit-photo' && (
          <form onSubmit={handleSubmitPhoto} className="space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-line">
              <div className="flex size-9 items-center justify-center rounded-xl bg-accent/20 text-accent">
                <IconCamera className="size-5" />
              </div>
              <div>
                <h3 className="text-[16px] font-bold tracking-tight">Alterar Foto de Perfil</h3>
                <p className="text-[12px] text-fg-3">Formatos suportados: PNG, JPG ou WebP</p>
              </div>
            </div>

            {errorMessage && (
              <div className="rounded-xl border border-danger/40 bg-danger/10 px-3.5 py-2 text-[12px] text-danger">
                {errorMessage}
              </div>
            )}

            <div className="flex flex-col items-center justify-center py-4">
              <div className="size-28 rounded-full overflow-hidden border-2 border-accent shadow-xl mb-4 bg-surface/60">
                <img
                  src={photoPreview || currentUser?.avatarUrl || generateDefaultAvatar(currentUser?.displayName || 'User')}
                  alt="Pré-visualização"
                  className="h-full w-full object-cover"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer rounded-xl border border-line bg-surface/60 px-4 py-2 text-[12.5px] font-medium text-fg hover:border-accent hover:text-accent transition-all">
                <IconUpload className="size-4" />
                <span>Escolher Imagem...</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />
              </label>
            </div>

            <div className="pt-2 flex justify-end gap-2.5 border-t border-line">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-xl border border-line px-4 py-2 text-[12.5px] font-medium text-fg-2 hover:bg-surface-2 hover:text-fg transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!photoPreview}
                className="rounded-xl bg-accent px-5 py-2 text-[12.5px] font-semibold text-accent-fg shadow-lg shadow-accent/25 hover:bg-accent-strong disabled:opacity-50 transition-all"
              >
                Salvar Nova Foto
              </button>
            </div>
          </form>
        )}

        {/* 3. DIALOG: ALTERAR NOME */}
        {activeDialog === 'edit-name' && (
          <form onSubmit={handleSubmitName} className="space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-line">
              <div className="flex size-9 items-center justify-center rounded-xl bg-accent/20 text-accent">
                <IconUser className="size-5" />
              </div>
              <div>
                <h3 className="text-[16px] font-bold tracking-tight">Alterar Nome de Exibição</h3>
                <p className="text-[12px] text-fg-3">O nome será atualizado em todo o MAXX OS</p>
              </div>
            </div>

            {errorMessage && (
              <div className="rounded-xl border border-danger/40 bg-danger/10 px-3.5 py-2 text-[12px] text-danger">
                {errorMessage}
              </div>
            )}

            <div>
              <label className="block text-[12px] font-medium text-fg-2 mb-1">Novo Nome de Exibição</label>
              <input
                type="text"
                required
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="Ex: Rangel"
                className="w-full rounded-xl border border-line bg-surface/50 px-3.5 py-2 text-[13px] text-fg outline-none focus:border-accent focus:ring-1 focus:ring-accent"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2.5 border-t border-line">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-xl border border-line px-4 py-2 text-[12.5px] font-medium text-fg-2 hover:bg-surface-2 hover:text-fg transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-xl bg-accent px-5 py-2 text-[12.5px] font-semibold text-accent-fg shadow-lg shadow-accent/25 hover:bg-accent-strong transition-all"
              >
                Salvar Nome
              </button>
            </div>
          </form>
        )}

        {/* 4. DIALOG: ALTERAR SENHA */}
        {activeDialog === 'change-password' && (
          <form onSubmit={handleSubmitPassword} className="space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-line">
              <div className="flex size-9 items-center justify-center rounded-xl bg-accent/20 text-accent">
                <IconLock className="size-5" />
              </div>
              <div>
                <h3 className="text-[16px] font-bold tracking-tight">Alterar Senha de Acesso</h3>
                <p className="text-[12px] text-fg-3">Proteção criptografada com derivação de chave</p>
              </div>
            </div>

            {errorMessage && (
              <div className="rounded-xl border border-danger/40 bg-danger/10 px-3.5 py-2 text-[12px] text-danger">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="flex items-center gap-1.5 rounded-xl border border-ok/40 bg-ok/10 px-3.5 py-2 text-[12px] text-ok">
                <IconCheck className="size-4" />
                <span>{successMessage}</span>
              </div>
            )}

            <div>
              <label className="block text-[12px] font-medium text-fg-2 mb-1">Senha Atual</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="Digite a senha atual"
                className="w-full rounded-xl border border-line bg-surface/50 px-3.5 py-2 text-[13px] text-fg outline-none focus:border-accent focus:ring-1 focus:ring-accent"
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium text-fg-2 mb-1">Nova Senha</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Mínimo 3 caracteres"
                className="w-full rounded-xl border border-line bg-surface/50 px-3.5 py-2 text-[13px] text-fg outline-none focus:border-accent focus:ring-1 focus:ring-accent"
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium text-fg-2 mb-1">Confirmar Nova Senha</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Repita a nova senha"
                className="w-full rounded-xl border border-line bg-surface/50 px-3.5 py-2 text-[13px] text-fg outline-none focus:border-accent focus:ring-1 focus:ring-accent"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2.5 border-t border-line">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-xl border border-line px-4 py-2 text-[12.5px] font-medium text-fg-2 hover:bg-surface-2 hover:text-fg transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-accent px-5 py-2 text-[12.5px] font-semibold text-accent-fg shadow-lg shadow-accent/25 hover:bg-accent-strong transition-all"
              >
                {isSubmitting ? 'Atualizando...' : 'Atualizar Senha'}
              </button>
            </div>
          </form>
        )}

        {/* 5. DIALOG: MEU PERFIL (DETALHES DA CONTA) */}
        {activeDialog === 'view-profile' && currentUser && (
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-line">
              <div className="flex size-9 items-center justify-center rounded-xl bg-accent/20 text-accent">
                <IconUser className="size-5" />
              </div>
              <div>
                <h3 className="text-[16px] font-bold tracking-tight">Meu Perfil — MAXX OS</h3>
                <p className="text-[12px] text-fg-3">Informações e preferências da conta pessoal</p>
              </div>
            </div>

            {/* Profile Identity Card */}
            <div className="flex items-center gap-4 rounded-xl border border-line bg-surface/40 p-4">
              <div className="relative size-16 shrink-0 rounded-2xl overflow-hidden border-2 border-accent shadow-md">
                <img
                  src={currentUser.avatarUrl || generateDefaultAvatar(currentUser.displayName)}
                  alt={currentUser.displayName}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="truncate text-[16px] font-bold text-fg">{currentUser.displayName}</h4>
                  <span className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Ativo
                  </span>
                </div>
                <p className="text-[12px] text-fg-3">@{currentUser.username}</p>
                <div className="mt-1 flex items-center gap-1.5 text-[11px] text-accent">
                  <IconShieldCheck className="size-3.5" />
                  <span className="font-semibold uppercase tracking-wider">
                    {currentUser.role === 'admin' ? 'Administrador' : 'Usuário'}
                  </span>
                </div>
              </div>
            </div>

            {/* Account Details Grid */}
            <div className="grid grid-cols-2 gap-2 text-[12px]">
              <div className="rounded-xl border border-line bg-surface/30 p-2.5">
                <span className="text-[10.5px] uppercase tracking-wider text-fg-4 font-semibold">Tema Ativo</span>
                <p className="mt-0.5 font-medium text-fg capitalize">{currentUser.preferences.theme || 'Ocean'}</p>
              </div>
              <div className="rounded-xl border border-line bg-surface/30 p-2.5">
                <span className="text-[10.5px] uppercase tracking-wider text-fg-4 font-semibold">Espaços Atribuídos</span>
                <p className="mt-0.5 font-medium text-fg">{currentUser.preferences.spaces?.length || 3} Espaços</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-1.5 pt-1">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-fg-4 px-1">Ações Rápidas</div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => openProfileDialog('edit-photo')}
                  className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-line bg-surface/40 p-2.5 text-[11px] font-medium text-fg hover:border-accent hover:text-accent transition-all"
                >
                  <IconCamera className="size-4" />
                  <span>Foto</span>
                </button>
                <button
                  type="button"
                  onClick={() => openProfileDialog('edit-name')}
                  className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-line bg-surface/40 p-2.5 text-[11px] font-medium text-fg hover:border-accent hover:text-accent transition-all"
                >
                  <IconEdit className="size-4" />
                  <span>Nome</span>
                </button>
                <button
                  type="button"
                  onClick={() => openProfileDialog('change-password')}
                  className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-line bg-surface/40 p-2.5 text-[11px] font-medium text-fg hover:border-accent hover:text-accent transition-all"
                >
                  <IconKey className="size-4" />
                  <span>Senha</span>
                </button>
              </div>
            </div>

            <div className="pt-2 flex justify-end border-t border-line">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-xl bg-accent px-5 py-2 text-[12.5px] font-semibold text-accent-fg shadow-lg shadow-accent/25 hover:bg-accent-strong transition-all"
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
