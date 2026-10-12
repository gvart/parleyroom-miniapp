import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import type { StudentGoal } from '@/api/types'
import { pathLabel, statusChip } from '@/lib/goal'
import { formatDateWithYear } from '@/lib/intl'
import { Pill, Section } from '@/ui'
import { GoalPath } from './GoalPath'

/** Compact goal on Home: path, what the student works on now, and a nudge to self-assess. Opens /goals. */
export function GoalHomeCard({ goal }: { goal: StudentGoal }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const chip = statusChip(goal.status, t)
  const preparing = goal.status === 'NO_ROADMAP'

  return (
    <Section eyebrow={t('goal_eyebrow')} title={goal.title}>
      <button
        type="button"
        onClick={() => navigate('/goals')}
        className="card tap"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          width: '100%',
          padding: 18,
          border: 0,
          textAlign: 'left',
          font: 'inherit',
          color: 'inherit',
          cursor: 'pointer',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, width: '100%' }}>
          {chip && <Pill tone={chip.tone}>{chip.label}</Pill>}
          <span style={{ fontSize: 'var(--text-caption)', fontWeight: 700, color: 'var(--ink-2)' }}>
            {t('goal_by', { date: formatDateWithYear(goal.deadline) })}
          </span>
        </span>

        {preparing ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="icon-tile">
              <span className="ms fill" style={{ fontSize: 20 }} aria-hidden="true">
                edit_calendar
              </span>
            </span>
            <span style={{ fontSize: 'var(--text-body)', fontWeight: 700 }}>{t('goal_preparing_title')}</span>
          </span>
        ) : (
          <>
            <span style={{ display: 'block', width: '100%' }}>
              <GoalPath goal={goal} />
              <span
                aria-hidden="true"
                style={{ display: 'block', marginTop: 8, fontSize: 'var(--text-caption)', fontWeight: 700, color: 'var(--ink-2)' }}
              >
                {pathLabel(goal, t)}
              </span>
            </span>
            {goal.currentCanDo && (
              <span style={{ display: 'block' }}>
                <span className="eyebrow" style={{ display: 'block', marginBottom: 4 }}>
                  {t('goal_now')}
                </span>
                <span
                  style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    fontSize: 'var(--text-body)',
                    fontWeight: 700,
                    lineHeight: 1.4,
                  }}
                >
                  {goal.currentCanDo}
                </span>
              </span>
            )}
          </>
        )}

        {goal.pendingSelfAssessment && (
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              width: '100%',
              padding: '10px 12px',
              borderRadius: 16,
              background: 'var(--accent-soft)',
              color: 'var(--accent-ink)',
              fontSize: 'var(--text-small)',
              fontWeight: 800,
            }}
          >
            <span className="ms fill" style={{ fontSize: 20 }} aria-hidden="true">
              celebration
            </span>
            <span style={{ flex: 1 }}>{t('goal_home_pending')}</span>
            <span className="ms" style={{ fontSize: 20 }} aria-hidden="true">
              chevron_right
            </span>
          </span>
        )}
      </button>
    </Section>
  )
}
