import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/auth/AuthGate'
import { useMyGoal } from '@/hooks/useGoals'
import type { StudentGoal } from '@/api/types'
import { pathLabel, roadmapEnabled, statusChip } from '@/lib/goal'
import { formatDateWithYear, formatPercent } from '@/lib/intl'
import { errorMessage } from '@/lib/errors'
import { Banner, Card, EmptyState, PageHeader, Pill, Ring } from '@/ui'
import { GoalPath } from './goal/GoalPath'
import { SelfAssessmentCard } from './goal/SelfAssessmentCard'

/** The student's learning goal: path, what they work on now, and the self-assessment. Teachers edit it in the portal. */
export function Goals() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const enabled = roadmapEnabled(user)
  const goalQuery = useMyGoal(enabled)

  if (!enabled) return <Navigate to="/" replace />

  if (goalQuery.isLoading) {
    return (
      <div style={{ padding: '12px 16px' }}>
        <div className="skeleton" style={{ height: 220, borderRadius: 'var(--radius-card)' }} />
      </div>
    )
  }

  if (goalQuery.isError) {
    return (
      <div>
        <PageHeader title={t('goal_eyebrow')} />
        <div style={{ padding: '0 16px' }}>
          <Banner tone="error">{errorMessage(goalQuery.error, t, 'error_generic')}</Banner>
        </div>
      </div>
    )
  }

  const goal = goalQuery.data?.goal
  if (!goal) {
    return (
      <div>
        <PageHeader title={t('goal_eyebrow')} />
        <EmptyState icon="flag" title={t('goal_none_title')} sub={t('goal_none_sub')} />
      </div>
    )
  }

  return <GoalView goal={goal} />
}

export function GoalView({ goal }: { goal: StudentGoal }) {
  const { t } = useTranslation()
  const [answered, setAnswered] = useState(false)
  const [coveredOpen, setCoveredOpen] = useState(false)
  const chip = statusChip(goal.status, t)
  const pending = goal.pendingSelfAssessment

  return (
    <div>
      <PageHeader
        eyebrow={t('goal_eyebrow')}
        title={goal.title}
        sub={t('goal_by', { date: formatDateWithYear(goal.deadline) })}
      />

      <div style={{ padding: '0 16px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {answered && !pending && (
          <Banner tone="success" icon="favorite">
            {t('sa_thanks')}
          </Banner>
        )}

        {pending && <SelfAssessmentCard key={pending.milestoneId} pending={pending} onDone={() => setAnswered(true)} />}

        {goal.status === 'NO_ROADMAP' ? (
          <Card className="animate-in" style={{ textAlign: 'center', padding: '28px 20px' }}>
            <span className="icon-tile" style={{ width: 56, height: 56, borderRadius: 18, margin: '0 auto 12px' }}>
              <span className="ms fill" style={{ fontSize: 28 }} aria-hidden="true">
                edit_calendar
              </span>
            </span>
            <h2 className="section-title" style={{ margin: '0 0 4px' }}>
              {t('goal_preparing_title')}
            </h2>
            <p style={{ margin: 0, fontSize: 'var(--text-small)', color: 'var(--ink-2)' }}>{t('goal_preparing_sub')}</p>
          </Card>
        ) : (
          <>
            <Card className="animate-in">
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 18 }}>
                <Ring
                  value={goal.progressPercent ?? 0}
                  size={72}
                  stroke={7}
                  tone="leaf"
                  label={formatPercent(goal.progressPercent ?? 0)}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 'var(--text-card-title)', fontWeight: 800, marginBottom: 6 }}>
                    {pathLabel(goal, t)}
                  </div>
                  {chip && <Pill tone={chip.tone}>{chip.label}</Pill>}
                </div>
              </div>
              <GoalPath goal={goal} />
            </Card>

            {(goal.currentCanDo || goal.nextCanDo) && (
              <Card className="animate-in" padded={false} style={{ overflow: 'hidden' }}>
                {goal.currentCanDo && (
                  <CanDoRow icon="flag" eyebrow={t('goal_now')} text={goal.currentCanDo} strong />
                )}
                {goal.nextCanDo && (
                  <div style={{ borderTop: goal.currentCanDo ? '1px solid var(--hair)' : undefined }}>
                    <CanDoRow icon="arrow_forward" eyebrow={t('goal_next')} text={goal.nextCanDo} />
                  </div>
                )}
              </Card>
            )}

            {goal.coveredTitles.length > 0 && (
              <Card className="animate-in" padded={false} style={{ overflow: 'hidden' }}>
                <button
                  type="button"
                  className="row-btn"
                  aria-expanded={coveredOpen}
                  aria-controls="goal-covered"
                  onClick={() => setCoveredOpen((o) => !o)}
                  style={{ minHeight: 56 }}
                >
                  <span className="icon-tile" style={{ background: 'var(--leaf-soft)', color: 'var(--leaf-ink)' }}>
                    <span className="ms fill" style={{ fontSize: 20 }} aria-hidden="true">
                      task_alt
                    </span>
                  </span>
                  <span style={{ flex: 1, fontSize: 'var(--text-card-title)', fontWeight: 800 }}>
                    {t('goal_covered')}
                  </span>
                  <Pill tone="moss">{goal.coveredTitles.length}</Pill>
                  <span
                    className="ms"
                    style={{
                      fontSize: 22,
                      color: 'var(--ink-3)',
                      transform: coveredOpen ? 'rotate(180deg)' : undefined,
                      transition: 'transform var(--spring-bouncy-ms) var(--spring-bouncy)',
                    }}
                    aria-hidden="true"
                  >
                    expand_more
                  </span>
                </button>
                {coveredOpen && (
                  <ul id="goal-covered" style={{ listStyle: 'none', margin: 0, padding: '0 18px 14px' }}>
                    {goal.coveredTitles.map((title, i) => (
                      <li
                        key={`${i}-${title}`}
                        style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '8px 0', fontSize: 'var(--text-body)' }}
                      >
                        <span className="ms" style={{ fontSize: 18, color: 'var(--leaf-ink)' }} aria-hidden="true">
                          check
                        </span>
                        <span>{title}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function CanDoRow({ icon, eyebrow, text, strong = false }: { icon: string; eyebrow: string; text: string; strong?: boolean }) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '16px 18px' }}>
      <span
        className="icon-tile"
        style={strong ? undefined : { background: 'var(--bg-2)', color: 'var(--ink-2)' }}
      >
        <span className={`ms${strong ? ' fill' : ''}`} style={{ fontSize: 20 }} aria-hidden="true">
          {icon}
        </span>
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="eyebrow" style={{ marginBottom: 4 }}>
          {eyebrow}
        </div>
        <div
          style={{
            fontSize: strong ? 'var(--text-card-title)' : 'var(--text-body)',
            fontWeight: strong ? 700 : 600,
            color: strong ? 'var(--ink)' : 'var(--ink-2)',
            lineHeight: 1.4,
          }}
        >
          {text}
        </div>
      </div>
    </div>
  )
}
