import fs from 'node:fs'
import path from 'node:path'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import axe from 'axe-core'
import type { HomeworkDetail as HomeworkDetailDto } from '@/api/types'
import { HomeworkDetail } from './HomeworkDetail'

/**
 * Deliberate axe exceptions for the Mini App. `meta-viewport`: user decision 2026-10-12 —
 * app-like, no zoom in the Telegram Mini App (`maximum-scale=1, user-scalable=no`).
 */
const ACCEPTED = new Set(['meta-viewport'])

const hw = {
  id: 'hw1',
  assignmentId: 'a1',
  title: 'Wortbox: Perfekt',
  dueDate: null,
  status: 'OPEN',
  instructions: 'Bitte bis Freitag.',
  feedback: null,
  units: [
    { assignmentItemId: 'it1', blockId: 'gf', itemId: 'g1' },
    { assignmentItemId: 'it1', blockId: 'gf', itemId: 'g2' },
    { assignmentItemId: 'it1', blockId: 'tf', itemId: 't1' },
  ],
  uploads: [],
  items: [
    {
      id: 'it1',
      kind: 'DOCUMENT',
      title: 'Perfekt',
      task: null,
      responseType: null,
      blocks: [
        {
          id: 'gf',
          type: 'gap_fill',
          interactive: true,
          instructions: 'Ergänze die Lücken.',
          wordBox: ['geht', 'geblieben'],
          items: [
            { id: 'g1', text: 'Wie ___ es dir?' },
            { id: 'g2', text: 'Ich bin zu Hause ___.' },
          ],
        },
        { id: 'tf', type: 'gap_fill', interactive: true, instructions: 'Schreib die Form.', items: [{ id: 't1', text: 'Ich ___ müde.' }] },
      ],
    },
  ],
} as unknown as HomeworkDetailDto

vi.mock('@/hooks/useHomework', () => ({
  useHomeworkDetail: () => ({ data: hw, isLoading: false, refetch: vi.fn() }),
  useSaveHomeworkAnswers: () => ({ mutate: vi.fn() }),
  useSubmitHomework: () => ({ mutateAsync: vi.fn(), isPending: false, error: null }),
  useDeleteHomeworkUpload: () => ({ mutateAsync: vi.fn() }),
}))

beforeAll(() => {
  // The shipped document shell (lang, title, viewport meta), so axe checks what users get.
  const html = fs.readFileSync(path.resolve(__dirname, '../../../../index.html'), 'utf8')
  document.documentElement.lang = html.match(/<html lang="([^"]+)"/)![1]
  document.title = html.match(/<title>([^<]+)<\/title>/)![1]
  document.head.insertAdjacentHTML('beforeend', html.match(/<meta name="viewport"[^>]*>/)![0])
  vi.stubGlobal('IntersectionObserver', class { observe() {} disconnect() {} })
})

describe('homework screen a11y', () => {
  it('has no axe violations beyond the accepted no-zoom viewport', async () => {
    render(
      <MemoryRouter initialEntries={['/homework/hw1']}>
        <Routes>
          <Route path="/homework/:id" element={<HomeworkDetail />} />
        </Routes>
      </MemoryRouter>,
    )
    await screen.findAllByTestId('gap')
    const result = await axe.run(document, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
      // jsdom has no layout, so contrast can't be measured here (the portal's audit covers it).
      rules: { 'color-contrast': { enabled: false } },
    })
    const ids = result.violations.map((v) => v.id)
    expect(ids.filter((id) => !ACCEPTED.has(id))).toEqual([])
    // The exception is still needed: if it ever stops firing, drop it from ACCEPTED.
    expect(ids).toContain('meta-viewport')
  })
})
