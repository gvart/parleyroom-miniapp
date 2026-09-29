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
}

export function LessonAttachmentsList({ lessonId }: Props) {
  const { t } = useTranslation()
  const { data } = useLessonMaterials(lessonId)
  const items = data?.items ?? []
  const [preview, setPreview] = useState<Material | null>(null)

  if (items.length === 0) return null

  return (
    <div style={{ marginBottom: 16 }}>
      <div className="eyebrow" style={{ marginBottom: 8 }}>
        {t('lesson_attachments')}
      </div>
      {items.map(({ material }) => (
        <button
          key={material.id}
          type="button"
          className="row-btn glass-inner tap"
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
          style={{ padding: '10px 12px', borderRadius: 18, marginBottom: 8 }}
        >
          <span className="icon-tile" style={{ width: 36, height: 36, borderRadius: 12 }}>
            <span className="ms fill" style={{ fontSize: 20 }} aria-hidden="true">
              {TYPE_ICON[material.type]}
            </span>
          </span>
          <span
            style={{
              flex: 1,
              minWidth: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontWeight: 600,
            }}
          >
            {material.name}
          </span>
          <span className="ms" style={{ fontSize: 18, color: 'var(--ink-3)' }} aria-hidden="true">
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
