import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, type PracticeQueueQuery, type PracticeRating } from '@/api/endpoints'
import type { NounArticle, OwnSentence } from '@/api/types'

/** Cards for one session: due first, then new ones within the daily budget. */
export function usePracticeQueue(query: PracticeQueueQuery, enabled = true) {
  return useQuery({
    queryKey: ['practice-queue', query],
    enabled,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    queryFn: () => api.practiceQueue(query),
  })
}

export function usePracticeStats() {
  return useQuery({
    queryKey: ['practice-stats'],
    staleTime: 30_000,
    queryFn: () => api.practiceStats(),
  })
}

/** Grades change due dates everywhere; mark those stale without refetching mid-session. */
function useMarkPracticeStale() {
  const qc = useQueryClient()
  return () => {
    for (const key of ['practice-stats', 'practice-queue', 'vocabulary']) {
      void qc.invalidateQueries({ queryKey: [key], refetchType: 'none' })
    }
  }
}

export function useReviewCard() {
  const markStale = useMarkPracticeStale()
  return useMutation({
    mutationFn: ({
      id,
      rating,
      mode,
      responseMs,
    }: {
      id: string
      rating: PracticeRating
      mode: 'DE_TO_MEANING' | 'MEANING_TO_DE'
      responseMs?: number
    }) => api.reviewVocabularyWord(id, { rating, mode, responseMs }),
    onSuccess: markStale,
  })
}

export function useCheckArticle() {
  const markStale = useMarkPracticeStale()
  return useMutation({
    mutationFn: ({ id, article, responseMs }: { id: string; article: NounArticle; responseMs?: number }) =>
      api.checkArticle(id, { article, responseMs }),
    onSuccess: markStale,
  })
}

export function useWordSentences(studentVocabId: string | undefined) {
  return useQuery({
    queryKey: ['sentences', studentVocabId],
    enabled: !!studentVocabId,
    queryFn: () => api.wordSentences(studentVocabId as string),
  })
}

export function useCreateSentence() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, sentence }: { id: string; sentence: string }) => api.createSentence(id, { sentence }),
    onSuccess: (created) => {
      qc.setQueryData<OwnSentence[]>(['sentences', created.studentVocabId], (old) => [created, ...(old ?? [])])
      void qc.invalidateQueries({ queryKey: ['practice-stats'], refetchType: 'none' })
    },
  })
}
