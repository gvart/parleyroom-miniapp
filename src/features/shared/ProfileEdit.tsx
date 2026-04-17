import { useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/AuthGate'
import { Avatar, Card } from '@/ui'
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
      setAvatarError('Image must be 5 MB or smaller.')
      return
    }
    try {
      await uploadAvatar.mutateAsync(file)
      await refreshUser()
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : 'Upload failed')
    }
  }

  async function onAvatarRemove() {
    setAvatarError(null)
    try {
      await deleteAvatar.mutateAsync()
      await refreshUser()
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : 'Remove failed')
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

  const labelStyle = {
    fontSize: 11,
    color: 'var(--ink-3)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    fontWeight: 600,
    marginBottom: 6,
  }
  const inputStyle = {
    width: '100%',
    padding: '12px 14px',
    background: 'var(--card)',
    color: 'var(--ink)',
    border: '1px solid var(--hair)',
    borderRadius: 14,
    fontSize: 14,
    outline: 'none',
  }

  return (
    <div>
      <div style={{ padding: '8px 20px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          type="button"
          className="tap"
          onClick={() => navigate('/settings')}
          style={{
            width: 40,
            height: 40,
            borderRadius: 999,
            background: 'var(--card)',
            border: '1px solid var(--hair)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--ink)',
          }}
        >
          <span className="ms" style={{ fontSize: 20 }}>arrow_back</span>
        </button>
        <div className="serif" style={{ fontSize: 22, letterSpacing: '-0.01em' }}>
          Edit profile
        </div>
      </div>

      <div
        style={{
          padding: '0 20px 22px',
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
          aria-label="Change photo"
          style={{
            position: 'relative',
            border: 0,
            background: 'transparent',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          <Avatar hue={172} initials={user.initials} size={96} src={user.avatarUrl} />
          <span
            style={{
              position: 'absolute',
              right: -2,
              bottom: -2,
              width: 32,
              height: 32,
              borderRadius: 999,
              background: 'var(--ink)',
              color: 'var(--bg)',
              border: '3px solid var(--bg)',
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
            className="tap"
            disabled={deleteAvatar.isPending}
            style={{
              marginTop: 12,
              border: 0,
              background: 'transparent',
              color: 'var(--ink-2)',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            {deleteAvatar.isPending ? 'Removing…' : 'Remove photo'}
          </button>
        ) : (
          <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 10 }}>
            Tap to add a photo
          </div>
        )}
        {avatarError && (
          <div
            style={{
              marginTop: 10,
              padding: '8px 14px',
              borderRadius: 12,
              background: 'oklch(0.96 0.05 25)',
              color: 'oklch(0.5 0.18 25)',
              fontSize: 12,
            }}
          >
            {avatarError}
          </div>
        )}
      </div>

      <form onSubmit={submit} style={{ padding: '0 20px' }}>
        <Card>
          <div style={{ marginBottom: 14 }}>
            <div style={labelStyle}>First name</div>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div style={{ marginBottom: 14 }}>
            <div style={labelStyle}>Last name</div>
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div style={{ marginBottom: 14 }}>
            <div style={labelStyle}>Email</div>
            <input value={user.email} readOnly style={{ ...inputStyle, opacity: 0.6 }} />
          </div>
          <div style={{ marginBottom: 4 }}>
            <div style={{ ...labelStyle, marginBottom: 8 }}>{t('level')}</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {LEVELS.map((lv) => (
                <button
                  type="button"
                  key={lv}
                  onClick={() => setLevel(lv)}
                  className="tap"
                  style={{
                    padding: '8px 14px',
                    borderRadius: 999,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: '1px solid var(--hair)',
                    background: level === lv ? 'var(--ink)' : 'transparent',
                    color: level === lv ? 'var(--bg)' : 'var(--ink)',
                  }}
                >
                  {lv}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {updateProfile.error && (
          <div
            style={{
              marginTop: 12,
              padding: '10px 14px',
              borderRadius: 12,
              background: 'oklch(0.96 0.05 25)',
              color: 'oklch(0.5 0.18 25)',
              fontSize: 13,
            }}
          >
            {updateProfile.error instanceof Error
              ? updateProfile.error.message
              : 'Save failed'}
          </div>
        )}

        <button
          type="submit"
          disabled={updateProfile.isPending}
          className="tap"
          style={{
            width: '100%',
            marginTop: 16,
            border: 0,
            cursor: updateProfile.isPending ? 'progress' : 'pointer',
            background: saved ? 'oklch(0.55 0.14 172)' : 'var(--ink)',
            color: saved ? '#fff' : 'var(--bg)',
            padding: '14px',
            borderRadius: 999,
            fontSize: 14,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            transition: 'all .2s var(--ease)',
            opacity: updateProfile.isPending ? 0.7 : 1,
          }}
        >
          <span className="ms fill" style={{ fontSize: 18 }}>
            {saved ? 'check' : 'save'}
          </span>
          {saved ? 'Saved' : updateProfile.isPending ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </div>
  )
}
