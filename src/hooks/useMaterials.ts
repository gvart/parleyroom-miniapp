import { useQuery } from '@tanstack/react-query'
import { api } from '@/api/endpoints'
import type { MaterialType } from '@/api/types'

export function useMaterials(type?: MaterialType) {
  return useQuery({
    queryKey: ['materials', type ?? 'all'],
    queryFn: () => api.materials(type ? { type } : {}),
  })
}
