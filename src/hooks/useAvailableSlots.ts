import { useQuery } from '@tanstack/react-query'
import { api } from '@/api/endpoints'

interface Params {
  teacherId: string | undefined
  /** ISO date (`YYYY-MM-DD`) — slots are computed for this one calendar day. */
  date: string | undefined
  durationMinutes: number
}

/** Bookable slots for one calendar day, for the given teacher + lesson length. */
export function useAvailableSlots({ teacherId, date, durationMinutes }: Params) {
  return useQuery({
    queryKey: ['available-slots', teacherId, date, durationMinutes],
    queryFn: () =>
      api.availableSlots(teacherId!, {
        from: `${date}T00:00:00Z`,
        to: `${date}T23:59:59Z`,
        durationMinutes,
      }),
    select: (data) => data.slots,
    enabled: Boolean(teacherId && date),
    staleTime: 30_000,
  })
}
