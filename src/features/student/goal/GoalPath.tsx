import { Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import type { StudentGoal } from '@/api/types'
import { pathLabel } from '@/lib/goal'

/** Milestone dots filled up to the current one. Read out as "Milestone 3 of 7". */
export function GoalPath({ goal }: { goal: StudentGoal }) {
  const { t } = useTranslation()
  return (
    <div className="goal-path" role="img" aria-label={pathLabel(goal, t)}>
      {goal.milestones.map((m, i) => (
        <Fragment key={m.id}>
          {i > 0 && <span className={`goal-path-line${m.done || m.current ? ' on' : ''}`} />}
          <span className="goal-path-dot" data-state={m.done ? 'done' : m.current ? 'current' : 'todo'}>
            {m.done && (
              <span className="ms" style={{ fontSize: 13, fontWeight: 700 }}>
                check
              </span>
            )}
          </span>
        </Fragment>
      ))}
    </div>
  )
}
