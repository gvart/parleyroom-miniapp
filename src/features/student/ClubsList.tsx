import { useTranslation } from 'react-i18next'
import { Banner, Button, Card, EmptyState, Pill } from '@/ui'
import { useJoinClub, useOpenClubs, useWithdrawJoinRequest } from '@/hooks/useClubs'
import { lessonDate, lessonTime } from '@/lib/lesson'
import { formatShortDate, formatWeekdayShort } from '@/lib/intl'
import type { OpenClub } from '@/api/types'

/** Open speaking/reading clubs of the student's teacher(s) — the Calendar tab's Clubs segment. */
export function ClubsList() {
  const { t } = useTranslation()
  const clubsQuery = useOpenClubs()

  if (clubsQuery.isLoading) {
    return (
      <div style={{ padding: '16px', fontSize: 'var(--text-small)', color: 'var(--ink-2)' }}>{t('loading')}</div>
    )
  }

  const clubs = clubsQuery.data ?? []
  if (clubs.length === 0) {
    return <EmptyState icon="groups" title={t('no_open_clubs_title')} sub={t('no_open_clubs_sub')} />
  }

  return (
    <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      {clubs.map((club) => (
        <ClubCard key={club.id} club={club} />
      ))}
    </div>
  )
}

function ClubCard({ club }: { club: OpenClub }) {
  const { t } = useTranslation()
  const join = useJoinClub()
  const withdraw = useWithdrawJoinRequest()

  const typeLabelKey = club.type === 'READING_CLUB' ? 'type_reading_club' : 'type_speaking_club'
  const full = club.myStatus == null && club.maxParticipants != null && club.takenSpots >= club.maxParticipants
  const error = join.error ?? withdraw.error

  return (
    <Card style={{ padding: 16, borderRadius: 22 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' }}>
        <Pill tone="violet">{t(typeLabelKey)}</Pill>
        {club.level && <Pill tone="neutral">{club.level}</Pill>}
      </div>
      <div style={{ fontSize: 'var(--text-card-title)', fontWeight: 800, marginBottom: 2 }}>
        {club.topic || club.title}
      </div>
      <div style={{ fontSize: 'var(--text-small)', color: 'var(--ink-2)', fontWeight: 700, marginBottom: 10 }}>
        {formatWeekdayShort(new Date(`${lessonDate(club.scheduledAt)}T00:00:00`))} {formatShortDate(club.scheduledAt)} ·{' '}
        {lessonTime(club.scheduledAt)} · {club.durationMinutes}m
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 'var(--text-caption)', color: 'var(--ink-2)', fontWeight: 700 }}>
          <span className="ms" style={{ fontSize: 15, verticalAlign: -2 }} aria-hidden="true">
            person
          </span>{' '}
          {club.teacher.firstName} ·{' '}
          {club.maxParticipants != null
            ? t('club_spots', { taken: club.takenSpots, total: club.maxParticipants })
            : t('club_spots_unlimited', { taken: club.takenSpots })}
        </div>
        <ClubAction club={club} full={full} join={join} withdraw={withdraw} />
      </div>
      {club.maxParticipants != null && (
        <div style={{ marginTop: 8 }}>
          <SpotsBar taken={club.takenSpots} total={club.maxParticipants} />
        </div>
      )}
      {error && (
        <div style={{ marginTop: 10 }}>
          <Banner tone="error">{t('action_failed')}</Banner>
        </div>
      )}
    </Card>
  )
}

/** Thin spots-taken bar under a capacity-limited club's meta row. */
function SpotsBar({ taken, total }: { taken: number; total: number }) {
  const ratio = total > 0 ? Math.min(1, taken / total) : 0
  const full = taken >= total
  return (
    <div className="progress-track" style={{ height: 5 }}>
      <div
        className="progress-fill"
        style={{ width: `${ratio * 100}%`, background: full ? 'var(--sunny-vivid)' : 'var(--accent)' }}
      />
    </div>
  )
}

function ClubAction({
  club,
  full,
  join,
  withdraw,
}: {
  club: OpenClub
  full: boolean
  join: ReturnType<typeof useJoinClub>
  withdraw: ReturnType<typeof useWithdrawJoinRequest>
}) {
  const { t } = useTranslation()

  if (club.myStatus === 'CONFIRMED') return <Pill tone="accent">{t('youre_in')}</Pill>
  if (club.myStatus === 'REJECTED') return <Pill tone="neutral">{t('club_declined')}</Pill>
  if (club.myStatus === 'REQUESTED') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Pill tone="warn">{t('club_requested')}</Pill>
        <Button size="sm" variant="ghost" loading={withdraw.isPending} onClick={() => withdraw.mutate(club.id)}>
          {t('withdraw_request')}
        </Button>
      </div>
    )
  }
  if (full) return <Pill tone="neutral">{t('club_full')}</Pill>
  return (
    <Button size="sm" variant="secondary" loading={join.isPending} onClick={() => join.mutate(club.id)}>
      {t('request_to_join')}
    </Button>
  )
}
