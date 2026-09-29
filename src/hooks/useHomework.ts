import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  api,
  type CreateAssignmentRequest,
  type HomeworkQuery,
  type SaveHomeworkAnswersRequest,
} from '@/api/endpoints'

export function useHomework(query: HomeworkQuery = {}) {
  return useQuery({
    queryKey: ['homework', query],
    queryFn: () => api.homework(query),
  })
}

export function useHomeworkDetail(id: string | null) {
  return useQuery({
    queryKey: ['homework', 'detail', id],
    queryFn: () => api.getHomework(id!),
    enabled: !!id,
  })
}

export function useSaveHomeworkAnswers() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: SaveHomeworkAnswersRequest }) =>
      api.saveHomeworkAnswers(id, body),
    onSuccess: (_data, { id }) => {
      void qc.invalidateQueries({ queryKey: ['homework', 'detail', id] })
    },
  })
}

export function useSubmitHomework() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.submitHomework(id),
    onSuccess: (_data, id) => {
      void qc.invalidateQueries({ queryKey: ['homework'] })
      void qc.invalidateQueries({ queryKey: ['homework', 'detail', id] })
    },
  })
}

export function useCreateAssignment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateAssignmentRequest) => api.createAssignment(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['homework'] })
      void qc.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}
