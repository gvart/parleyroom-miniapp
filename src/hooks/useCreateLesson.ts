import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, type CreateLessonRequest } from '@/api/endpoints'

export function useCreateLesson() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateLessonRequest) => api.createLesson(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['lessons'] })
    },
  })
}

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => api.users(),
  })
}
