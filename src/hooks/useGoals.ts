import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/endpoints'
import type { GoalStatus } from '@/api/types'

export function useGoals(params?: { studentId?: string; status?: GoalStatus }) {
  const studentId = params?.studentId
  const status = params?.status
  return useQuery({
    queryKey: ['goals', studentId ?? 'self', status ?? 'all'],
    queryFn: () => api.goals({ studentId, status }),
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

export function useUpdateGoalProgress() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, progress }: { id: string; progress: number }) =>
      api.updateGoalProgress(id, progress),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['goals'] })
    },
  })
}

export function useDeleteGoal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.deleteGoal(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['goals'] })
    },
  })
}
