import { useCallback, useEffect, useRef, useState, type FocusEvent } from 'react'
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
import { useKeyboardOpen } from '@/hooks/useKeyboardOpen'
import type { HomeworkAnswerInput } from '@/api/endpoints'
import { addressOf, answersFromUnits, unitKey, type AnswerMap, type UnitAnswer } from './lib/answers'
import { uploadHomeworkFile } from './lib/upload'
import { HomeworkItems } from './HomeworkItems'

const AUTOSAVE_DELAY_MS = 900

// This screen is a fullscreen AppShell route (no floating tab bar, no top
// safe-area padding from AppShell), so it manages both itself — same pattern
// as LessonLive.
const TOP_INSET =
  'calc(var(--tg-viewport-safe-area-inset-top, env(safe-area-inset-top)) + var(--tg-viewport-content-safe-area-inset-top, 0px))'
const BOTTOM_INSET =
  'calc(var(--tg-viewport-safe-area-inset-bottom, env(safe-area-inset-bottom)) + var(--tg-viewport-content-safe-area-inset-bottom, 0px))'
// Approximate rendered height of the sticky Submit bar below (button + its
// padding), used both for the page's own bottom padding and for reserving
// scroll room above the bar when a field near the bottom is focused.
const SUBMIT_BAR_SPACE = 96

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
  const [fieldFocused, setFieldFocused] = useState(false)
  const keyboardOpen = useKeyboardOpen()

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

  // useKeyboardAwareLayout's focusin handler scrolls the focused field into
  // view, but the layout viewport never shrinks for an open keyboard (that's
  // the whole reason `--keyboard-inset` exists) — so without this, a field
  // near the bottom can still land under the keyboard, or under this
  // screen's own sticky Submit bar when the keyboard is closed. Reserve that
  // space as scroll padding on `#root` — the app's actual scroll container
  // (html/body are locked to prevent the whole mini app from dragging; see
  // styles.css) — while this screen is mounted.
  const editableNow = isOpenStatus(hw?.status ?? 'SUBMITTED')
  useEffect(() => {
    if (!editableNow) return
    const scroller = document.getElementById('root')
    if (!scroller) return
    scroller.style.scrollPaddingBottom = `calc(var(--keyboard-inset, 0px) + ${SUBMIT_BAR_SPACE}px)`
    return () => {
      scroller.style.removeProperty('scroll-padding-bottom')
    }
  }, [editableNow])

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
      <div style={{ paddingTop: TOP_INSET }}>
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

  // Show the sticky Submit bar only when there's no keyboard (or a focused
  // field) to cover — see the effect above for how the space it needs back
  // gets reserved during scroll-into-view while it's hidden.
  const showSubmitBar = editable && !keyboardOpen && !fieldFocused

  // Only an actual text field toggles the bar — a button click also bubbles
  // a focus event, and we don't want the Submit bar hiding itself mid-tap.
  const onFieldFocus = (e: FocusEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) setFieldFocused(true)
  }
  const onFieldBlur = (e: FocusEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) setFieldFocused(false)
  }

  return (
    <div
      style={{ paddingTop: TOP_INSET, paddingBottom: editable ? SUBMIT_BAR_SPACE + 40 : 24 }}
      onFocus={onFieldFocus}
      onBlur={onFieldBlur}
    >
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

      {showSubmitBar && (
        <div
          style={{
            position: 'fixed',
            left: 0,
            right: 0,
            // No floating tab bar on this fullscreen route — just clear the
            // safe area. Hidden entirely (above) while a keyboard could cover it.
            bottom: BOTTOM_INSET,
            padding: '10px 16px 14px',
            background: 'linear-gradient(to top, var(--bg) 65%, transparent)',
            zIndex: 40,
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
