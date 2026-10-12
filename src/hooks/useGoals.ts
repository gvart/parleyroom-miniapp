import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/endpoints'
import type { MyGoalResponse, SelfAssessmentInput } from '@/api/types'

const MY_GOAL_KEY = ['goals', 'my'] as const

/** The student's active goal; pass `enabled: false` while the `roadmap` flag is off (the route 404s). */
export function useMyGoal(enabled: boolean) {
  return useQuery({
    queryKey: MY_GOAL_KEY,
    queryFn: () => api.myGoal(),
    enabled,
  })
}

/** Answers with the refreshed goal, so the cache is replaced instead of refetched. */
export function useSelfAssessMilestone() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ milestoneId, body }: { milestoneId: string; body: SelfAssessmentInput }) =>
      api.selfAssessMilestone(milestoneId, body),
    onSuccess: (data: MyGoalResponse) => {
      qc.setQueryData(MY_GOAL_KEY, data)
    },
  })
}
