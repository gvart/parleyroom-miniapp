import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/endpoints'
import type { GoalStatus } from '@/api/types'

export function useGoals(status?: GoalStatus) {
  return useQuery({
    queryKey: ['goals', status ?? 'all'],
    queryFn: () => api.goals(status),
  })
}

export function useCreateGoal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { studentId: string; description: string; targetDate?: string | null }) =>
      api.createGoal(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['goals'] })
    },
  })
}

export function useCompleteGoal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.completeGoal(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['goals'] })
    },
  })
}

export function useAbandonGoal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.abandonGoal(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['goals'] })
    },
  })
}
