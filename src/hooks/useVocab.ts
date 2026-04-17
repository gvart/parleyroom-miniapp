import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, type VocabularyQuery } from '@/api/endpoints'

export function useVocab(query: VocabularyQuery = {}) {
  return useQuery({
    queryKey: ['vocabulary', query],
    queryFn: () => api.vocabulary(query),
  })
}

export function useReviewVocab() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.reviewVocabularyWord(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['vocabulary'] })
    },
  })
}
