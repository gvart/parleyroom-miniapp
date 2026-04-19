import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { openLink } from '@telegram-apps/sdk-react'
import { Sheet } from '@/ui'
import { useLessonMaterials } from '@/hooks/useLessonMaterials'
import type { Material, MaterialType } from '@/api/types'
import { MaterialPreview } from './MaterialPreview'

const TYPE_ICON: Record<MaterialType, string> = {
  PDF: 'description',
  AUDIO: 'graphic_eq',
  VIDEO: 'play_circle',
  LINK: 'link',
}

interface Props {
  lessonId: string
  dark?: boolean
}

export function LessonAttachmentsList({ lessonId, dark = false }: Props) {
  const { t } = useTranslation()
  const { data } = useLessonMaterials(lessonId)
  const items = data?.items ?? []
  const [preview, setPreview] = useState<Material | null>(null)

  if (items.length === 0) return null

  const inkFaint = dark ? '#A7A69C' : 'var(--ink-3)'
  const ink = dark ? '#F2F1EC' : 'var(--ink)'
  const bg = dark ? 'rgba(255,255,255,0.04)' : 'var(--card)'

  return (
    <div style={{ marginBottom: 16 }}>
      <div
        style={{
          fontSize: 11,
          color: inkFaint,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          fontWeight: 600,
          marginBottom: 8,
        }}
      >
        {t('lesson_attachments')}
      </div>
      {items.map(({ material }) => (
        <button
          key={material.id}
          type="button"
          className="tap"
          onClick={() => {
            if (material.type === 'LINK' && material.downloadUrl) {
              try {
                openLink(material.downloadUrl)
              } catch {
                window.open(material.downloadUrl, '_blank', 'noopener,noreferrer')
              }
              return
            }
            setPreview(material)
          }}
          style={{
            width: '100%',
            padding: '10px 12px',
            background: bg,
            borderRadius: 10,
            marginBottom: 6,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            border: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid var(--hair)',
            color: ink,
            fontSize: 14,
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <span className="ms" style={{ fontSize: 22, color: 'var(--accent)' }}>
            {TYPE_ICON[material.type]}
          </span>
          <span
            style={{
              flex: 1,
              minWidth: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontWeight: 500,
            }}
          >
            {material.name}
          </span>
          <span className="ms" style={{ fontSize: 16, color: inkFaint }}>
            {material.type === 'LINK' ? 'open_in_new' : 'chevron_right'}
          </span>
        </button>
      ))}

      <Sheet open={!!preview} onClose={() => setPreview(null)}>
        {preview && <MaterialPreview material={preview} onClose={() => setPreview(null)} />}
      </Sheet>
    </div>
  )
}
