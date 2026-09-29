import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { openLink } from '@telegram-apps/sdk-react'
import { Card, EmptyState, PageHeader, Pill, Sheet, type Tone, TONE_VARS } from '@/ui'
import { useFolderTree } from '@/hooks/useMaterialFolders'
import { useMaterials } from '@/hooks/useMaterials'
import type { FolderTreeNode, Material, MaterialFolder, MaterialType } from '@/api/types'
import { MaterialPreview } from './MaterialPreview'

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

function flattenTree(nodes: FolderTreeNode[]): MaterialFolder[] {
  const out: MaterialFolder[] = []
  const walk = (list: FolderTreeNode[]) => {
    for (const n of list) {
      out.push(n.folder)
      walk(n.children)
    }
  }
  walk(nodes)
  return out
}

function childrenOf(nodes: FolderTreeNode[], parentId: string | null): FolderTreeNode[] {
  if (parentId === null) return nodes
  const walk = (list: FolderTreeNode[]): FolderTreeNode[] | null => {
    for (const n of list) {
      if (n.folder.id === parentId) return n.children
      const found = walk(n.children)
      if (found) return found
    }
    return null
  }
  return walk(nodes) ?? []
}

function ancestry(nodes: FolderTreeNode[], folderId: string | null): MaterialFolder[] {
  if (folderId === null) return []
  const flat = flattenTree(nodes)
  const byId = new Map(flat.map((f) => [f.id, f]))
  const chain: MaterialFolder[] = []
  let cur = byId.get(folderId)
  while (cur) {
    chain.unshift(cur)
    cur = cur.parentFolderId ? byId.get(cur.parentFolderId) : undefined
  }
  return chain
}

export function StudentMaterials() {
  const { t } = useTranslation()
  const [folderId, setFolderId] = useState<string | null>(null)
  const [preview, setPreview] = useState<Material | null>(null)

  const folderTree = useFolderTree()
  const tree = folderTree.data ?? []

  const materialsQuery = useMaterials(
    folderId === null ? { unfiled: true, pageSize: 100 } : { folderId, pageSize: 100 },
  )
  const materials = materialsQuery.data?.materials ?? []

  const visibleFolders = useMemo(() => childrenOf(tree, folderId), [tree, folderId])
  const breadcrumb = useMemo(() => ancestry(tree, folderId), [tree, folderId])

  const handleTap = (m: Material) => {
    if (m.type === 'LINK' && m.downloadUrl) {
      try {
        openLink(m.downloadUrl)
      } catch {
        window.open(m.downloadUrl, '_blank', 'noopener,noreferrer')
      }
      return
    }
    setPreview(m)
  }

  return (
    <div>
      <PageHeader eyebrow={t('materials')} title={t('library_title')} />

      {/* Breadcrumbs */}
      {(folderId !== null || breadcrumb.length > 0) && (
        <div
          style={{
            padding: '0 16px 10px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 4,
            alignItems: 'center',
            fontSize: 'var(--text-small)',
            fontWeight: 700,
            color: 'var(--ink-2)',
          }}
        >
          <button
            type="button"
            onClick={() => setFolderId(null)}
            className="tap"
            style={{
              background: 'transparent',
              border: 0,
              padding: 0,
              color: folderId === null ? 'var(--ink)' : 'var(--ink-2)',
              fontWeight: folderId === null ? 600 : 400,
              cursor: 'pointer',
            }}
          >
            {t('library_root')}
          </button>
          {breadcrumb.map((f, i) => {
            const isLast = i === breadcrumb.length - 1
            return (
              <span key={f.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <span style={{ color: 'var(--ink-3)' }}>/</span>
                <button
                  type="button"
                  onClick={() => setFolderId(f.id)}
                  className="tap"
                  style={{
                    background: 'transparent',
                    border: 0,
                    padding: 0,
                    color: isLast ? 'var(--ink)' : 'var(--ink-2)',
                    fontWeight: isLast ? 600 : 400,
                    cursor: 'pointer',
                  }}
                >
                  {f.name}
                </button>
              </span>
            )
          })}
        </div>
      )}

      {/* Folders */}
      {visibleFolders.length > 0 && (
        <div
          style={{
            padding: '0 16px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 10,
            marginBottom: 14,
          }}
        >
          {visibleFolders.map((n) => (
            <Card
              key={n.folder.id}
              onClick={() => setFolderId(n.folder.id)}
              padded
              className="tap"
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, padding: 12, borderRadius: 22 }}
            >
              <span className="icon-tile" style={{ background: 'var(--grape-soft)', color: 'var(--grape-ink)' }}>
                <span className="ms fill" style={{ fontSize: 22 }} aria-hidden="true">
                  folder
                </span>
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 'var(--text-small)',
                    fontWeight: 800,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {n.folder.name}
                </div>
                <div style={{ fontSize: 'var(--text-caption)', fontWeight: 600, color: 'var(--ink-2)' }}>
                  {t('library_folder_count', {
                    count: n.folder.materialCount + n.folder.childFolderCount,
                  })}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Materials */}
      {materials.length === 0 && visibleFolders.length === 0 && !materialsQuery.isLoading && !folderTree.isLoading ? (
        <EmptyState
            icon="collections_bookmark"
            title={t('empty_materials_title')}
            sub={t('empty_materials_sub')}
          />
      ) : (
        <div
          style={{
            padding: '0 16px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 10,
          }}
        >
          {materials.map((m) => {
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
                    {m.level ? ` · ${m.level}` : ''}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <Sheet open={!!preview} onClose={() => setPreview(null)}>
        {preview && <MaterialPreview material={preview} onClose={() => setPreview(null)} />}
      </Sheet>
    </div>
  )
}
