import { useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/AuthGate'
import { Avatar, Banner, Button, Card } from '@/ui'
import { useUpdateProfile } from '@/hooks/useUpdateProfile'
import { useDeleteAvatar, useUploadAvatar } from '@/hooks/useAvatar'
import type { Level } from '@/api/types'

const LEVELS: Level[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

export function ProfileEdit() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, refreshUser } = useAuth()
  const updateProfile = useUpdateProfile()
  const uploadAvatar = useUploadAvatar()
  const deleteAvatar = useDeleteAvatar()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [firstName, setFirstName] = useState(user.firstName)
  const [lastName, setLastName] = useState(user.lastName)
  const [level, setLevel] = useState<Level | null>(user.level ?? null)
  const [saved, setSaved] = useState(false)
  const [avatarError, setAvatarError] = useState<string | null>(null)

  async function onAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setAvatarError(null)
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError(t('image_too_large'))
      return
    }
    try {
      await uploadAvatar.mutateAsync(file)
      await refreshUser()
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : t('upload_failed'))
    }
  }

  async function onAvatarRemove() {
    setAvatarError(null)
    try {
      await deleteAvatar.mutateAsync()
      await refreshUser()
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : t('remove_failed'))
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaved(false)
    try {
      await updateProfile.mutateAsync({
        firstName: firstName !== user.firstName ? firstName : undefined,
        lastName: lastName !== user.lastName ? lastName : undefined,
        level: level !== user.level ? level : undefined,
      })
      await refreshUser()
      setSaved(true)
      setTimeout(() => navigate('/settings'), 700)
    } catch {
      // mutation exposes the error via updateProfile.error
    }
  }

  return (
    <div>
      <div style={{ padding: '12px 16px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          type="button"
          className="ico-btn"
          onClick={() => navigate('/settings')}
          aria-label={t('back')}
        >
          <span className="ms" style={{ fontSize: 20 }}>arrow_back</span>
        </button>
        <div className="section-title">
          {t('edit_profile')}
        </div>
      </div>

      <div
        style={{
          padding: '0 16px 22px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={onAvatarChange}
          style={{ display: 'none' }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="tap"
          disabled={uploadAvatar.isPending || deleteAvatar.isPending}
          aria-label={t('change_photo')}
          style={{
            position: 'relative',
            border: 0,
            background: 'transparent',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          <Avatar hue={150} initials={user.initials} size={96} src={user.avatarUrl} />
          <span
            style={{
              position: 'absolute',
              right: -2,
              bottom: -2,
              width: 32,
              height: 32,
              borderRadius: 999,
              background: 'var(--accent-face)',
              color: 'var(--on-accent)',
              border: '3px solid var(--glass-fallback)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span className="ms" style={{ fontSize: 16 }}>
              {uploadAvatar.isPending ? 'hourglass_empty' : 'photo_camera'}
            </span>
          </span>
        </button>
        {user.avatarUrl ? (
          <button
            type="button"
            onClick={onAvatarRemove}
            className="link-action"
            disabled={deleteAvatar.isPending}
            style={{ marginTop: 10, color: 'var(--coral-ink)' }}
          >
            {deleteAvatar.isPending ? t('removing_ellipsis') : t('remove_photo')}
          </button>
        ) : (
          <div style={{ fontSize: 'var(--text-caption)', fontWeight: 700, color: 'var(--ink-2)', marginTop: 10 }}>
            {t('tap_to_add_photo')}
          </div>
        )}
        {avatarError && (
          <Banner tone="error" style={{ marginTop: 10 }}>
            {avatarError}
          </Banner>
        )}
      </div>

      <form onSubmit={submit} style={{ padding: '0 16px' }}>
        <Card>
          <div style={{ marginBottom: 14 }}>
            <div className="eyebrow field-label">{t('first_name_label')}</div>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="glass-field"
            />
          </div>
          <div style={{ marginBottom: 14 }}>
            <div className="eyebrow field-label">{t('last_name_label')}</div>
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="glass-field"
            />
          </div>
          <div style={{ marginBottom: 14 }}>
            <div className="eyebrow field-label">{t('email')}</div>
            <input value={user.email} readOnly className="glass-field" style={{ opacity: 0.6 }} />
          </div>
          <div style={{ marginBottom: 4 }}>
            <div className="eyebrow field-label">{t('level')}</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {LEVELS.map((lv) => (
                <button
                  type="button"
                  key={lv}
                  onClick={() => setLevel(lv)}
                  aria-pressed={level === lv}
                  className={`chip${level === lv ? ' on' : ''}`}
                >
                  {lv}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {updateProfile.error && (
          <Banner tone="error" style={{ marginTop: 12 }}>
            {updateProfile.error instanceof Error
              ? updateProfile.error.message
              : t('save_failed')}
          </Banner>
        )}

        <Button
          type="submit"
          block
          disabled={updateProfile.isPending}
          leadingIcon={saved ? 'check' : 'save'}
          style={{ marginTop: 16 }}
        >
          {saved ? t('saved') : updateProfile.isPending ? t('saving_ellipsis') : t('save_changes')}
        </Button>
      </form>
    </div>
  )
}
