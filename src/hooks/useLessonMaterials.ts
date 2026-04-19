import { useQuery } from '@tanstack/react-query'
import { api } from '@/api/endpoints'

export function useLessonMaterials(lessonId: string | undefined) {
  return useQuery({
    queryKey: ['lesson-materials', lessonId],
    queryFn: () => api.lessonMaterials(lessonId!),
    enabled: !!lessonId,
  })
}
