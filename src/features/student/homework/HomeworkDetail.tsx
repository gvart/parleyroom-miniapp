import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { Banner, Button, ScreenHeader, Sheet, SuccessState } from '@/ui'
import {
  useDeleteHomeworkUpload,
  useHomeworkDetail,
  useSaveHomeworkAnswers,
  useSubmitHomework,
} from '@/hooks/useHomework'
import { computeDue, dueLabel, isOpenStatus, isReworkStatus } from '@/lib/homework'
import { hapticSuccess } from '@/lib/haptics'
import type { HomeworkAnswerInput } from '@/api/endpoints'
import { addressOf, answersFromUnits, unitKey, type AnswerMap, type UnitAnswer } from './lib/answers'
import { uploadHomeworkFile } from './lib/upload'
import { HomeworkItems } from './HomeworkItems'

const AUTOSAVE_DELAY_MS = 900

/** Full-screen homework detail: view, answer, autosave, submit, feedback, resubmit. */
export function HomeworkDetail() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const detailQuery = useHomeworkDetail(id ?? null)
  const saveAnswers = useSaveHomeworkAnswers()
  const submit = useSubmitHomework()
  const deleteUpload = useDeleteHomeworkUpload()

  const hw = detailQuery.data
  const [answers, setAnswers] = useState<AnswerMap>({})
  const [seededId, setSeededId] = useState<string | null>(null)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [justSubmitted, setJustSubmitted] = useState(false)

  const pending = useRef<Map<string, UnitAnswer | null>>(new Map())
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const flushRef = useRef<() => void>(() => {})

  // Seed local answers from the server once per homework id — a background
  // refetch (e.g. after an upload) must not clobber what the student is typing.
  useEffect(() => {
    if (hw && hw.id !== seededId) {
      setAnswers(answersFromUnits(hw.units))
      setSeededId(hw.id)
    }
  }, [hw, seededId])

  const flush = useCallback(() => {
    if (!hw || pending.current.size === 0) return
    const changes: HomeworkAnswerInput[] = [...pending.current.entries()].map(([key, answer]) => ({
      ...addressOf(key),
      answer,
    }))
    pending.current.clear()
    setSaveState('saving')
    saveAnswers.mutate(
      { id: hw.id, body: { answers: changes } },
      {
        onSuccess: () => setSaveState('saved'),
        onError: () => setSaveState('error'),
      },
    )
  }, [hw, saveAnswers])
  flushRef.current = flush

  useEffect(() => {
    // Flush any pending autosave when leaving the screen (route change or unmount).
    return () => {
      clearTimeout(timer.current)
      flushRef.current()
    }
  }, [])

  const scheduleFlush = useCallback(() => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => flushRef.current(), AUTOSAVE_DELAY_MS)
  }, [])

  const onChange = useCallback(
    (key: string, value: UnitAnswer) => {
      setAnswers((prev) => ({ ...prev, [key]: value }))
      pending.current.set(key, value)
      scheduleFlush()
    },
    [scheduleFlush],
  )

  const onUpload = useCallback(
    async (itemId: string, file: Blob, name: string, onProgress: (pct: number) => void) => {
      if (!hw) return
      const upload = await uploadHomeworkFile(hw.id, itemId, file, name, onProgress)
      const key = unitKey({ assignmentItemId: itemId })
      setAnswers((prev) => {
        const uploadIds = [...(prev[key]?.uploadIds ?? []), upload.id]
        const next = { ...prev, [key]: { ...prev[key], uploadIds } }
        pending.current.set(key, next[key])
        return next
      })
      await detailQuery.refetch()
      scheduleFlush()
      return upload
    },
    [hw, detailQuery, scheduleFlush],
  )

  const onDeleteUpload = useCallback(
    async (uploadId: string) => {
      if (!hw) return
      const upload = hw.uploads.find((u) => u.id === uploadId)
      if (!upload) return
      await deleteUpload.mutateAsync({ id: hw.id, itemId: upload.assignmentItemId, uploadId })
      const key = unitKey({ assignmentItemId: upload.assignmentItemId })
      setAnswers((prev) => {
        const uploadIds = (prev[key]?.uploadIds ?? []).filter((x) => x !== uploadId)
        const next = { ...prev, [key]: { ...prev[key], uploadIds } }
        pending.current.set(key, next[key])
        return next
      })
      scheduleFlush()
    },
    [hw, deleteUpload, scheduleFlush],
  )

  const doSubmit = async () => {
    if (!hw) return
    clearTimeout(timer.current)
    flush()
    try {
      await submit.mutateAsync(hw.id)
      hapticSuccess()
      setJustSubmitted(true)
      setTimeout(() => {
        setConfirmOpen(false)
        navigate('/homework')
      }, 1300)
    } catch {
      /* error surfaces via submit.error in the sheet */
    }
  }

  if (detailQuery.isLoading || !hw) {
    return (
      <div>
        <ScreenHeader title={t('homework')} />
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[0, 1].map((i) => (
            <div key={i} className="skeleton" style={{ height: 140, borderRadius: 22 }} />
          ))}
        </div>
      </div>
    )
  }

  const editable = isOpenStatus(hw.status)
  const rework = isReworkStatus(hw)
  const showResults = hw.status === 'REVIEWED' || hw.status === 'DONE'
  const due = computeDue(hw.dueDate)
  const dueText = due.kind === 'none' ? '' : dueLabel(due, t, { prefixed: true })

  return (
    <div style={{ paddingBottom: editable ? 96 : 24 }}>
      <ScreenHeader title={hw.title} />

      <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {dueText && (
          <div className="eyebrow" style={{ marginTop: -8 }}>
            {dueText}
          </div>
        )}

        {rework && (
          <Banner tone="warn" icon="undo">
            {t('hw_returned_banner')}
          </Banner>
        )}
        {hw.status === 'SUBMITTED' && <Banner tone="info">{t('hw_pending_review_banner')}</Banner>}
        {hw.feedback && (hw.status === 'REVIEWED' || hw.status === 'DONE' || rework) && (
          <Banner tone={rework ? 'warn' : 'success'} icon="forum">
            <strong style={{ display: 'block', marginBottom: 2 }}>{t('teacher_feedback')}</strong>
            {hw.feedback}
          </Banner>
        )}
        {hw.instructions && (
          <div className="glass-inner" style={{ borderRadius: 18, padding: 14, fontSize: 'var(--text-body)', color: 'var(--ink)', lineHeight: 1.5 }} lang="de">
            {hw.instructions}
          </div>
        )}

        <HomeworkItems
          hw={hw}
          answers={answers}
          onChange={editable ? onChange : undefined}
          showResults={showResults}
          unitSlot={(key) => {
            const unit = hw.units.find((u) => unitKey(u) === key)
            return unit?.comment ? (
              <p style={{ marginTop: 6, fontSize: 'var(--text-small)', color: 'var(--ink-2)', display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                <span className="ms" style={{ fontSize: 15, flexShrink: 0 }} aria-hidden="true">
                  chat_bubble
                </span>
                {unit.comment}
              </p>
            ) : null
          }}
          onUpload={editable ? onUpload : undefined}
          onDeleteUpload={editable ? onDeleteUpload : undefined}
        />

        {editable && (
          <div aria-live="polite" style={{ fontSize: 'var(--text-caption)', color: 'var(--ink-3)', textAlign: 'center' }}>
            {saveState === 'saving' && t('saving_ellipsis')}
            {saveState === 'saved' && t('saved')}
            {saveState === 'error' && <span style={{ color: 'var(--coral-ink)' }}>{t('hw_save_failed')}</span>}
          </div>
        )}
      </div>

      {editable && (
        <div
          style={{
            position: 'fixed',
            left: 0,
            right: 0,
            bottom: 'calc(env(safe-area-inset-bottom, 0px) + var(--keyboard-inset, 0px))',
            padding: '10px 16px 14px',
            background: 'linear-gradient(to top, var(--bg) 55%, transparent)',
          }}
        >
          <Button block leadingIcon="send" onClick={() => setConfirmOpen(true)}>
            {rework ? t('hw_resubmit') : t('ok_submit')}
          </Button>
        </div>
      )}

      <Sheet
        open={confirmOpen}
        onClose={() => {
          if (!submit.isPending) setConfirmOpen(false)
        }}
      >
        <div style={{ padding: '0 16px 4px' }}>
          {justSubmitted ? (
            <SuccessState icon="check" title={t('submitted_title')} sub={t('submitted_sub')} />
          ) : (
            <>
              <h2 className="section-title" style={{ margin: '0 0 8px' }}>
                {rework ? t('hw_resubmit_title') : t('hw_submit_title')}
              </h2>
              <p style={{ fontSize: 'var(--text-body)', color: 'var(--ink-2)', marginBottom: 18 }}>{t('hw_submit_confirm')}</p>
              {submit.error && (
                <Banner tone="error" style={{ marginBottom: 12 }}>
                  {t('submit_failed')}
                </Banner>
              )}
              <Button block leadingIcon="send" loading={submit.isPending} onClick={() => void doSubmit()}>
                {rework ? t('hw_resubmit') : t('ok_submit')}
              </Button>
            </>
          )}
        </div>
      </Sheet>
    </div>
  )
}
