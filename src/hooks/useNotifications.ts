import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/endpoints'

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.notifications(),
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  })
}

export function useMarkNotificationsViewed() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (ids: string[]) => api.markNotificationsViewed(ids),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}
