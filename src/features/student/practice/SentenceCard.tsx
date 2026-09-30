import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, TextArea } from '@/ui'
import type { OwnSentence, VocabularyWord } from '@/api/types'
import { vocabHeadword, vocabMeaning } from '@/lib/vocab'

/**
 * Free-write practice: write an example sentence using the word. The keyboard
 * is kept clear of the textarea/save button by the app-wide keyboard-aware
 * layout (`--keyboard-inset`, global scroll-into-view on focus).
 */
export function SentenceCard({ word, onSave, onNext }: {
  word: VocabularyWord
  /** Resolves with the saved sentence (+ feedback, if graded), or null on failure (try again). */
  onSave: (sentence: string) => Promise<OwnSentence | null>
  onNext: () => void
}) {
  const { t } = useTranslation()
  const [text, setText] = useState('')
  const [saved, setSaved] = useState<OwnSentence | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setText('')
    setSaved(null)
  }, [word.id])

  const submit = async () => {
    const trimmed = text.trim()
    if (!trimmed || saving) return
    setSaving(true)
    const result = await onSave(trimmed)
    setSaving(false)
    if (result) setSaved(result)
  }

  const graded = saved?.feedback
  const flagged = graded ? graded.isCorrect === false : false

  return (
    <div
      style={{ flex: 1, padding: '8px 16px 20px', display: 'flex', flexDirection: 'column', gap: 14, minHeight: 0, overflowY: 'auto' }}
    >
      <div className="card" style={{ padding: 16, flexShrink: 0 }}>
        <span className="eyebrow">{t('write_sentence_prompt')}</span>
        <div className="font-headline" style={{ fontSize: 'var(--text-section-title)', marginTop: 4 }} lang="de">
          {vocabHeadword(word)}
        </div>
        <div style={{ fontSize: 'var(--text-small)', color: 'var(--ink-2)' }}>{vocabMeaning(word)}</div>
      </div>

      {saved ? (
        <div className="card" style={{ padding: 16 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontWeight: 800,
              color: flagged ? 'var(--sunny-ink)' : 'var(--leaf-ink)',
            }}
          >
            <span className="ms fill" style={{ fontSize: 20 }} aria-hidden="true">
              {flagged ? 'info' : 'check_circle'}
            </span>
            {flagged ? t('sentence_needs_work') : t('sentence_saved')}
          </div>
          {graded?.corrected && graded.corrected !== saved.sentence && (
            <div style={{ fontSize: 'var(--text-body)', color: 'var(--ink-2)', marginTop: 8 }} lang="de">
              „{graded.corrected}“
            </div>
          )}
          <Button block style={{ marginTop: 14 }} onClick={onNext}>
            {t('practice_next')}
          </Button>
        </div>
      ) : (
        <>
          <TextArea
            placeholder={t('write_sentence_placeholder')}
            rows={4}
            value={text}
            onChange={(e) => setText(e.target.value)}
            autoFocus
            lang="de"
          />
          <Button block disabled={!text.trim()} loading={saving} onClick={submit}>
            {t('save_sentence')}
          </Button>
        </>
      )}
    </div>
  )
}
