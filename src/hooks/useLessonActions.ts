import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/endpoints'

export function useAcceptLesson() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.acceptLesson(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['lessons'] })
    },
  })
}

export function useCancelLesson() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      api.cancelLesson(id, reason),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['lessons'] })
    },
  })
}
