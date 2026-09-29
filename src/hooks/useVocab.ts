import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, type PracticeRating, type VocabularyQuery } from '@/api/endpoints'

export function useVocab(query: VocabularyQuery = {}) {
  return useQuery({
    queryKey: ['vocabulary', query],
    queryFn: () => api.vocabulary(query),
  })
}

export function useReviewVocab() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, rating }: { id: string; rating: PracticeRating }) =>
      api.reviewVocabularyWord(id, { rating, mode: 'DE_TO_MEANING' }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['vocabulary'] })
    },
  })
}
