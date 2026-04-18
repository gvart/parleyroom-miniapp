import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Sheet } from '@/ui'
import { useCreateMaterial } from '@/hooks/useCreateMaterial'
import type { MaterialType } from '@/api/types'

const TYPES: Array<{ key: MaterialType; labelKey: string; accept: string }> = [
  { key: 'PDF', labelKey: 'pdf', accept: 'application/pdf' },
  { key: 'AUDIO', labelKey: 'audio', accept: 'audio/*' },
  { key: 'VIDEO', labelKey: 'video', accept: 'video/*' },
  { key: 'LINK', labelKey: 'link', accept: '' },
]

const MAX_BYTES = 50 * 1024 * 1024

interface Props {
  open: boolean
  onClose: () => void
}

export function UploadMaterialSheet({ open, onClose }: Props) {
  const { t } = useTranslation()
  const create = useCreateMaterial()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [type, setType] = useState<MaterialType>('PDF')
  const [name, setName] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [url, setUrl] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setType('PDF')
      setName('')
      setFile(null)
      setUrl('')
      setError(null)
    }
  }, [open])

  const isLink = type === 'LINK'
  const canSubmit =
    name.trim().length > 0 &&
    (isLink ? url.trim().length > 0 : Boolean(file)) &&
    !create.isPending

  function pickFile() {
    fileInputRef.current?.click()
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    setError(null)
    if (f.size > MAX_BYTES) {
      setError(t('file_too_large'))
      return
    }
    setFile(f)
    if (!name.trim()) setName(f.name.replace(/\.[^.]+$/, ''))
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canSubmit) return
    setError(null)
    try {
      await create.mutateAsync({
        name: name.trim(),
        type,
        file: isLink ? null : file,
        url: isLink ? url.trim() : null,
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('upload_failed'))
    }
  }

  const labelStyle = {
    fontSize: 11,
    color: 'var(--ink-3)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    fontWeight: 600,
    marginBottom: 8,
  }
  const inputStyle = {
    width: '100%',
    padding: '12px 14px',
    background: 'var(--card)',
    color: 'var(--ink)',
    border: '1px solid var(--hair)',
    borderRadius: 14,
    fontSize: 15,
    fontFamily: 'inherit',
    outline: 'none',
  }

  const acceptAttr = TYPES.find((opt) => opt.key === type)?.accept ?? ''

  return (
    <Sheet open={open} onClose={onClose}>
      <form onSubmit={submit} style={{ padding: '0 22px 10px' }}>
        <div className="serif" style={{ fontSize: 26, letterSpacing: '-0.01em', marginBottom: 18 }}>
          {t('upload_material_title')}
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={labelStyle}>{t('material_type_label')}</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {TYPES.map((opt) => (
              <button
                type="button"
                key={opt.key}
                onClick={() => {
                  setType(opt.key)
                  setFile(null)
                  setUrl('')
                  setError(null)
                }}
                className="tap"
                style={{
                  padding: '8px 14px',
                  borderRadius: 999,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: '1px solid var(--hair)',
                  background: type === opt.key ? 'var(--ink)' : 'transparent',
                  color: type === opt.key ? 'var(--bg)' : 'var(--ink)',
                }}
              >
                {t(opt.labelKey)}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={labelStyle}>{t('material_name_label')}</div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('material_name_placeholder')}
            style={inputStyle}
          />
        </div>

        {isLink ? (
          <div style={{ marginBottom: 18 }}>
            <div style={labelStyle}>{t('material_url_label')}</div>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={t('material_url_placeholder')}
              type="url"
              style={inputStyle}
            />
          </div>
        ) : (
          <div style={{ marginBottom: 18 }}>
            <div style={labelStyle}>{t('material_file_label')}</div>
            <input
              ref={fileInputRef}
              type="file"
              accept={acceptAttr}
              onChange={onFile}
              style={{ display: 'none' }}
            />
            <button
              type="button"
              onClick={pickFile}
              className="tap"
              style={{
                width: '100%',
                border: '1px dashed var(--hair-strong)',
                background: 'transparent',
                color: 'var(--ink)',
                padding: '14px 16px',
                borderRadius: 14,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <span className="ms" style={{ fontSize: 22, color: 'var(--accent)' }}>
                {file ? 'check_circle' : 'upload_file'}
              </span>
              <span style={{ flex: 1 }}>{file ? file.name : t('pick_file')}</span>
              {file && (
                <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>
                  {(file.size / 1024 / 1024).toFixed(1)} MB
                </span>
              )}
            </button>
          </div>
        )}

        {error && (
          <div
            style={{
              marginBottom: 12,
              padding: '10px 14px',
              borderRadius: 12,
              background: 'oklch(0.96 0.05 25)',
              color: 'oklch(0.5 0.18 25)',
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="tap"
          style={{
            width: '100%',
            border: 0,
            cursor: canSubmit ? 'pointer' : 'not-allowed',
            background: canSubmit ? 'var(--ink)' : 'var(--hair-strong)',
            color: canSubmit ? 'var(--bg)' : 'var(--ink-3)',
            padding: '14px',
            borderRadius: 999,
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          {create.isPending ? `${t('upload_material_button')}…` : t('upload_material_button')}
        </button>
      </form>
    </Sheet>
  )
}
