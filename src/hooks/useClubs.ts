import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/endpoints'

export function useOpenClubs() {
  return useQuery({
    queryKey: ['open-clubs'],
    queryFn: () => api.openClubs(),
    // The backend doesn't guarantee an order — soonest first, like the calendar.
    select: (clubs) => [...clubs].sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt)),
  })
}

export function useJoinClub() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.joinLesson(id),
    // Invalidate on settle, not just success — a CLUB_FULL/409 still means the
    // spot count the user saw is stale, so refetch either way.
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: ['open-clubs'] })
      void qc.invalidateQueries({ queryKey: ['lessons'] })
    },
  })
}

export function useWithdrawJoinRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.withdrawJoinRequest(id),
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: ['open-clubs'] })
    },
  })
}
