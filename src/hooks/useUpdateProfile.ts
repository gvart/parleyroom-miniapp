import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api, type UpdateProfileRequest } from '@/api/endpoints'

export function useUpdateProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (patch: UpdateProfileRequest) => api.updateMe(patch),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['me'] })
    },
  })
}
