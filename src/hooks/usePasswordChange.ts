import { useMutation } from '@tanstack/react-query'
import { api } from '@/api/endpoints'

export function useChangePassword() {
  return useMutation({
    mutationFn: async (newPassword: string) => {
      const { token } = await api.requestPasswordReset()
      await api.confirmPasswordReset(token, newPassword)
    },
  })
}
