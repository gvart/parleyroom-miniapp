import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/endpoints'
import type { NativeLanguage } from '@/api/types'

export function useUpdateStudentNativeLanguage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ studentId, nativeLanguage }: { studentId: string; nativeLanguage: NativeLanguage }) =>
      api.updateStudentNativeLanguage(studentId, nativeLanguage),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['users'] })
    },
  })
}
