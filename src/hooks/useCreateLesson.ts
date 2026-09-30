import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, type CreateLessonRequest } from '@/api/endpoints'

export function useCreateLesson() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateLessonRequest) => api.createLesson(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['lessons'] })
      // The booked slot is no longer free — refresh any slot pickers showing it.
      void qc.invalidateQueries({ queryKey: ['available-slots'] })
    },
  })
}

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => api.users(),
  })
}
