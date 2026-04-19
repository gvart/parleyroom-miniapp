import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { openLink } from '@telegram-apps/sdk-react'
import { Card, Pill, Sheet } from '@/ui'
import { useFolderTree } from '@/hooks/useMaterialFolders'
import { useMaterials } from '@/hooks/useMaterials'
import type { FolderTreeNode, Material, MaterialFolder, MaterialType } from '@/api/types'
import { MaterialPreview } from './MaterialPreview'

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
      <div
        style={{
          padding: '8px 20px 14px',
        }}
      >
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

      {/* Breadcrumbs */}
      {(folderId !== null || breadcrumb.length > 0) && (
        <div
          style={{
            padding: '0 20px 10px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 4,
            alignItems: 'center',
            fontSize: 13,
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
            padding: '0 20px',
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
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}
            >
              <span className="ms" style={{ fontSize: 28, color: 'var(--accent)' }}>
                folder
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {n.folder.name}
                </div>
                <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>
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
        <div style={{ padding: '40px 30px', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>◌</div>
          <div className="serif" style={{ fontSize: 22, marginBottom: 4 }}>
            {t('empty_materials_title')}
          </div>
          <div style={{ fontSize: 13, color: 'var(--ink-2)', maxWidth: 280, margin: '0 auto' }}>
            {t('empty_materials_sub')}
          </div>
        </div>
      ) : (
        <div
          style={{
            padding: '0 20px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 10,
          }}
        >
          {materials.map((m) => {
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
