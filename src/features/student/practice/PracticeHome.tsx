import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Button, EmptyState, ScreenHeader, StatChip } from '@/ui'
import { usePracticeQueue } from '@/hooks/usePractice'
import { MODE_ICON, MODE_LABEL_KEY, PRACTICE_UI_MODES, queueModeFor, type PracticeUIMode } from './modes'

const SESSION_SIZE = 20

/** Practice setup: mode picker, due/new counts for the chosen mode, start button. */
export function PracticeHome() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [mode, setMode] = useState<PracticeUIMode>('DE_TO_MEANING')
  const queue = usePracticeQueue({ mode: queueModeFor(mode), limit: SESSION_SIZE })

  const cards = queue.data?.cards ?? []
  const due = queue.data?.dueCount ?? 0
  const fresh = queue.data?.newCount ?? 0

  return (
    <div>
      <ScreenHeader title={t('practice_title')} />

      <div style={{ padding: '0 16px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {PRACTICE_UI_MODES.map((m) => (
          <button
            type="button"
            key={m}
            onClick={() => setMode(m)}
            aria-pressed={mode === m}
            className={`mode-chip${mode === m ? ' on' : ''}`}
          >
            <span className="ms" style={{ fontSize: 22 }} aria-hidden="true">
              {MODE_ICON[m]}
            </span>
            {t(MODE_LABEL_KEY[m])}
          </button>
        ))}
      </div>

      {queue.isLoading ? null : cards.length === 0 ? (
        <EmptyState icon="task_alt" title={t('practice_empty_title')} sub={t('practice_empty_sub')} />
      ) : (
        <div style={{ padding: '0 16px 24px' }}>
          {(due > 0 || fresh > 0) && (
            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              {due > 0 && <StatChip icon="alarm" value={due} label={t('due_now')} tone="grape" />}
              {fresh > 0 && <StatChip icon="auto_awesome" value={fresh} label={t('new_words')} tone="sky" />}
            </div>
          )}
          <Button block leadingIcon="play_arrow" onClick={() => navigate(`/vocab/practice/session?mode=${mode}`)}>
            {t('start_practice_count', { count: cards.length })}
          </Button>
        </div>
      )}
    </div>
  )
}
