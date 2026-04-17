import { useQuery } from '@tanstack/react-query'
import { api, type VocabularyQuery } from '@/api/endpoints'

export function useVocab(query: VocabularyQuery = {}) {
  return useQuery({
    queryKey: ['vocabulary', query],
    queryFn: () => api.vocabulary(query),
  })
}
