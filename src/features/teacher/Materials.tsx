import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, Pill, Sheet } from '@/ui'
import { useMaterials } from '@/hooks/useMaterials'
import type { Material, MaterialType } from '@/api/types'

const TYPE_HUE: Record<MaterialType, number> = {
  PDF: 25,
  AUDIO: 290,
  VIDEO: 210,
  LINK: 75,
}

const TYPE_ICON: Record<MaterialType, string> = {
  PDF: 'description',
  AUDIO: 'graphic_eq',
  VIDEO: 'play_circle',
  LINK: 'link',
}

function bytesToLabel(bytes: number | null): string {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export function Materials() {
  const { t } = useTranslation()
  const materialsQuery = useMaterials()
  const [openMaterial, setOpenMaterial] = useState<Material | null>(null)
  const [comingSoon, setComingSoon] = useState(false)

  const items = materialsQuery.data?.materials ?? []

  const handleTap = (m: Material) => {
    if (m.type === 'LINK' && m.downloadUrl) {
      window.open(m.downloadUrl, '_blank', 'noopener,noreferrer')
      return
    }
    setOpenMaterial(m)
  }

  return (
    <div>
      <div
        style={{
          padding: '8px 20px 18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              color: 'var(--ink-3)',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              fontWeight: 600,
              marginBottom: 6,
            }}
          >
            {t('materials')}
          </div>
          <div
            className="serif"
            style={{ fontSize: 30, lineHeight: 1.05, letterSpacing: '-0.02em' }}
          >
            {t('library_title')}
            <span style={{ color: 'var(--accent)' }}>.</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setComingSoon(true)}
          className="tap"
          aria-label={t('coming_soon')}
          style={{
            width: 40,
            height: 40,
            borderRadius: 999,
            background: 'var(--ink)',
            color: 'var(--bg)',
            border: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <span className="ms" style={{ fontSize: 20 }}>
            add
          </span>
        </button>
      </div>

      {items.length === 0 ? (
        !materialsQuery.isLoading && (
          <div style={{ padding: '40px 30px', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>◌</div>
            <div className="serif" style={{ fontSize: 22, marginBottom: 4 }}>
              {t('empty_materials_title')}
            </div>
            <div style={{ fontSize: 13, color: 'var(--ink-2)', maxWidth: 280, margin: '0 auto' }}>
              {t('empty_materials_sub')}
            </div>
          </div>
        )
      ) : (
        <div
          style={{
            padding: '0 20px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 10,
          }}
        >
          {items.map((m) => {
            const hue = TYPE_HUE[m.type]
            return (
              <Card
                key={m.id}
                onClick={() => handleTap(m)}
                padded={false}
                style={{ overflow: 'hidden', cursor: 'pointer' }}
              >
                <div
                  style={{
                    height: 88,
                    background: `linear-gradient(135deg, oklch(0.85 0.10 ${hue}) 0%, oklch(0.55 0.14 ${hue}) 100%)`,
                    position: 'relative',
                  }}
                >
                  <div style={{ position: 'absolute', top: 10, left: 10 }}>
                    <Pill
                      style={{
                        background: 'rgba(0,0,0,0.35)',
                        color: '#fff',
                        backdropFilter: 'blur(6px)',
                      }}
                    >
                      {t(m.type.toLowerCase())}
                    </Pill>
                  </div>
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 10,
                      right: 10,
                      color: '#fff',
                      opacity: 0.8,
                    }}
                  >
                    <span className="ms" style={{ fontSize: 28 }}>
                      {TYPE_ICON[m.type]}
                    </span>
                  </div>
                </div>
                <div style={{ padding: '10px 12px 12px' }}>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      lineHeight: 1.25,
                      marginBottom: 4,
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {m.name}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: 'var(--ink-3)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                    }}
                  >
                    {m.fileSize ? bytesToLabel(m.fileSize) : t(m.type.toLowerCase())}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <Sheet open={!!openMaterial} onClose={() => setOpenMaterial(null)}>
        {openMaterial && (
          <div style={{ padding: '0 22px' }}>
            <div className="serif" style={{ fontSize: 26, letterSpacing: '-0.01em', marginBottom: 6 }}>
              {openMaterial.name}
            </div>
            <div style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 18 }}>
              {t(openMaterial.type.toLowerCase())} · {bytesToLabel(openMaterial.fileSize) || '—'}
            </div>
            {openMaterial.downloadUrl ? (
              <a
                href={openMaterial.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="tap"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  width: '100%',
                  border: 0,
                  background: 'var(--ink)',
                  color: 'var(--bg)',
                  padding: '14px',
                  borderRadius: 999,
                  fontSize: 14,
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                <span className="ms" style={{ fontSize: 18 }}>
                  open_in_new
                </span>
                {t('open_link')}
              </a>
            ) : (
              <div style={{ fontSize: 13, color: 'var(--ink-2)', textAlign: 'center', padding: 20 }}>
                {t('preview_soon')}
              </div>
            )}
          </div>
        )}
      </Sheet>

      <Sheet open={comingSoon} onClose={() => setComingSoon(false)}>
        <div style={{ padding: '0 22px' }}>
          <div className="serif" style={{ fontSize: 26, letterSpacing: '-0.01em', marginBottom: 6 }}>
            {t('coming_soon')}
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>
            {t('empty_materials_sub')}
          </div>
        </div>
      </Sheet>
    </div>
  )
}
