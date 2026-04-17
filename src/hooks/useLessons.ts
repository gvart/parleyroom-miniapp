import { useQuery } from '@tanstack/react-query'
import { api, type LessonsQuery } from '@/api/endpoints'

export function useLessons(query: LessonsQuery = {}) {
  return useQuery({
    queryKey: ['lessons', query],
    queryFn: () => api.lessons(query),
  })
}
