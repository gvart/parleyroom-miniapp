import { useQuery } from '@tanstack/react-query'
import { api } from '@/api/endpoints'
import type { Level, MaterialSkill, MaterialType } from '@/api/types'

export interface MaterialsQuery {
  folderId?: string
  unfiled?: boolean
  lessonId?: string
  type?: MaterialType
  level?: Level
  skill?: MaterialSkill
  page?: number
  pageSize?: number
}

export function useMaterials(query: MaterialsQuery = {}) {
  return useQuery({
    queryKey: ['materials', query],
    queryFn: () => api.materials(query),
  })
}
