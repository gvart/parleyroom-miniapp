import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, EmptyState, PageHeader, Pill, Sheet, type Tone, TONE_VARS } from '@/ui'
import { useMaterials } from '@/hooks/useMaterials'
import type { Material, MaterialType } from '@/api/types'
import { UploadMaterialSheet } from './UploadMaterialSheet'

const TYPE_TONE: Record<MaterialType, Tone> = {
  PDF: 'coral',
  AUDIO: 'grape',
  VIDEO: 'sky',
  LINK: 'sunny',
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
  const [uploadOpen, setUploadOpen] = useState(false)

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
      <PageHeader
        eyebrow={t('materials')}
        title={t('library_title')}
        action={
          <button
            type="button"
            onClick={() => setUploadOpen(true)}
            className="btn-primary"
            aria-label={t('upload_material_title')}
            style={{ width: 44, minHeight: 44, padding: 0 }}
          >
            <span className="ms" style={{ fontSize: 24 }} aria-hidden="true">
              add
            </span>
          </button>
        }
      />

      {items.length === 0 ? (
        !materialsQuery.isLoading && (
          <EmptyState
            icon="collections_bookmark"
            title={t('empty_materials_title')}
            sub={t('empty_materials_sub')}
          />
        )
      ) : (
        <div
          style={{
            padding: '0 16px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 10,
          }}
        >
          {items.map((m) => {
            const tone = TONE_VARS[TYPE_TONE[m.type]]
            return (
              <Card
                key={m.id}
                onClick={() => handleTap(m)}
                padded={false}
                className="tap"
                style={{ overflow: 'hidden', cursor: 'pointer', borderRadius: 24 }}
              >
                <div
                  style={{
                    height: 84,
                    margin: 6,
                    borderRadius: 18,
                    background: `radial-gradient(circle at 25% 20%, color-mix(in srgb, ${tone.vivid} 35%, transparent), ${tone.soft} 70%)`,
                    position: 'relative',
                  }}
                >
                  <div style={{ position: 'absolute', top: 8, left: 8 }}>
                    <Pill style={{ background: 'var(--card-surface)', color: tone.ink }}>
                      {t(m.type.toLowerCase())}
                    </Pill>
                  </div>
                  <span
                    className="ms fill"
                    style={{ position: 'absolute', bottom: 8, right: 10, fontSize: 30, color: tone.ink }}
                    aria-hidden="true"
                  >
                    {TYPE_ICON[m.type]}
                  </span>
                </div>
                <div style={{ padding: '6px 12px 12px' }}>
                  <div
                    style={{
                      fontSize: 'var(--text-small)',
                      fontWeight: 800,
                      lineHeight: 1.3,
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
                      fontSize: 'var(--text-label)',
                      fontWeight: 800,
                      color: 'var(--ink-3)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
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
            <div className="section-title" style={{ marginBottom: 6 }}>
              {openMaterial.name}
            </div>
            <div style={{ fontSize: 'var(--text-small)', color: 'var(--ink-2)', marginBottom: 18 }}>
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
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                <span className="ms" style={{ fontSize: 18 }}>
                  open_in_new
                </span>
                {t('open_link')}
              </a>
            ) : (
              <div style={{ fontSize: 'var(--text-small)', color: 'var(--ink-2)', textAlign: 'center', padding: 20 }}>
                {t('preview_soon')}
              </div>
            )}
          </div>
        )}
      </Sheet>

      <UploadMaterialSheet open={uploadOpen} onClose={() => setUploadOpen(false)} />
    </div>
  )
}
