import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/endpoints'
import type { MaterialType } from '@/api/types'

interface CreateMaterialInput {
  name: string
  type: MaterialType
  file?: File | null
  url?: string | null
  studentId?: string | null
  lessonId?: string | null
}

export function useCreateMaterial() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateMaterialInput) => api.createMaterial(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['materials'] })
    },
  })
}
