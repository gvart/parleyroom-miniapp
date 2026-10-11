import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/endpoints'
import type { GoalInput, GoalStatus } from '@/api/types'

/** Goals with their computed progress. Students get their own; teachers the ones they set. */
export function useGoals(params?: { studentId?: string; status?: GoalStatus }) {
  const studentId = params?.studentId
  const status = params?.status
  return useQuery({
    queryKey: ['goals', studentId ?? 'self', status ?? 'all'],
    queryFn: () => api.goals({ studentId, status }),
  })
}

/** Teacher only. */
export function useCreateGoal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: GoalInput) => api.createGoal(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['goals'] })
    },
  })
}

/** The goal's teacher only: mark it achieved, archive it or reactivate it. */
export function useSetGoalStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: GoalStatus }) => api.setGoalStatus(id, status),
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
