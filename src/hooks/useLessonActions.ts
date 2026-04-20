import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api, type CompleteLessonRequest, type ReflectLessonRequest, type RescheduleRequest } from '@/api/endpoints'

function useLessonMutation<TVars, TResult>(
  mutationFn: (vars: TVars) => Promise<TResult>,
) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['lessons'] })
      void qc.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

export function useAcceptLesson() {
  return useLessonMutation((id: string) => api.acceptLesson(id))
}

export function useCancelLesson() {
  return useLessonMutation(({ id, reason }: { id: string; reason?: string }) =>
    api.cancelLesson(id, reason),
  )
}

export function useStartLesson() {
  return useLessonMutation((id: string) => api.startLesson(id))
}

export function useCompleteLesson() {
  return useLessonMutation(
    ({ id, body }: { id: string; body?: CompleteLessonRequest }) =>
      api.completeLesson(id, body ?? {}),
  )
}

export function useReflectOnLesson() {
  return useLessonMutation(
    ({ id, body }: { id: string; body: ReflectLessonRequest }) =>
      api.reflectOnLesson(id, body),
  )
}

export function useJoinLesson() {
  return useLessonMutation((id: string) => api.joinLesson(id))
}

export function useAcceptJoinRequest() {
  return useLessonMutation(
    ({ lessonId, studentId }: { lessonId: string; studentId: string }) =>
      api.acceptJoinRequest(lessonId, studentId),
  )
}

export function useRejectJoinRequest() {
  return useLessonMutation(
    ({ lessonId, studentId }: { lessonId: string; studentId: string }) =>
      api.rejectJoinRequest(lessonId, studentId),
  )
}

export function useRequestReschedule() {
  return useLessonMutation(({ id, body }: { id: string; body: RescheduleRequest }) =>
    api.requestReschedule(id, body),
  )
}

export function useAcceptReschedule() {
  return useLessonMutation((id: string) => api.acceptReschedule(id))
}

export function useRejectReschedule() {
  return useLessonMutation((id: string) => api.rejectReschedule(id))
}
