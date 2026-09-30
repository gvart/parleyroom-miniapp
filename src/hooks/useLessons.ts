import { useQuery } from '@tanstack/react-query'
import { api, type LessonsQuery } from '@/api/endpoints'
import { addDaysISO } from '@/lib/lesson'

// The backend returns the first `pageSize` lessons ascending with no default
// window, so an unbounded call silently drops upcoming lessons once a
// student has more than the default page of history. Default to a
// generous -30d..+90d window and a bigger page unless the caller overrides.
export function useLessons(query: LessonsQuery = {}) {
  const resolved: LessonsQuery = {
    ...query,
    from: query.from ?? addDaysISO(-30),
    to: query.to ?? addDaysISO(90),
    pageSize: query.pageSize ?? 100,
  }
  return useQuery({
    queryKey: ['lessons', resolved],
    queryFn: () => api.lessons(resolved),
  })
}
