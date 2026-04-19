import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/endpoints'
import type { Level, MaterialSkill, MaterialType } from '@/api/types'

interface CreateMaterialInput {
  name: string
  type: MaterialType
  file?: File | null
  url?: string | null
  folderId?: string | null
  level?: Level | null
  skill?: MaterialSkill | null
}

export function useCreateMaterial() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateMaterialInput) => api.createMaterial(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['materials'] })
      void qc.invalidateQueries({ queryKey: ['material-folders'] })
    },
  })
}
