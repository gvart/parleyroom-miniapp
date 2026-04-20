import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  api,
  type CreateHomeworkRequest,
  type HomeworkQuery,
  type SubmitHomeworkRequest,
} from '@/api/endpoints'

export function useHomework(query: HomeworkQuery = {}) {
  return useQuery({
    queryKey: ['homework', query],
    queryFn: () => api.homework(query),
  })
}

export function useSubmitHomework() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: SubmitHomeworkRequest }) =>
      api.submitHomework(id, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['homework'] })
    },
  })
}

export function useCreateHomework() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateHomeworkRequest) => api.createHomework(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['homework'] })
      void qc.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}
