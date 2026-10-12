import { useState } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { GapFillBlock, HomeworkUnit } from '@/api/types'
import { InteractiveBlock } from './InteractiveBlock'
import type { AnswerMap } from '../lib/answers'

/** IntersectionObserver stand-in: tests decide what is on screen. */
const observers: { el: Element; cb: IntersectionObserverCallback }[] = []
class FakeIO {
  constructor(private cb: IntersectionObserverCallback) {}
  observe(el: Element) {
    observers.push({ el, cb: this.cb })
  }
  disconnect() {}
  unobserve() {}
  takeRecords() {
    return []
  }
}
function setVisible(el: Element, visible: boolean) {
  act(() => {
    for (const o of observers.filter((x) => x.el === el)) {
      o.cb([{ target: el, isIntersecting: visible, intersectionRatio: visible ? 1 : 0 } as IntersectionObserverEntry], {} as IntersectionObserver)
    }
  })
}

function mockReducedMotion(reduce: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: reduce && query.includes('reduce'),
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }))
}

const block: GapFillBlock = {
  id: 'blk',
  type: 'gap_fill',
  interactive: true,
  instructions: 'Ergänze.',
  wordBox: ['geht', 'kann', 'hat'],
  items: [
    { id: 'i1', text: 'Wie ___ es dir?' },
    { id: 'i2', text: 'Sie ___ gut singen, er ___ Zeit.' },
  ],
} as GapFillBlock

const units = new Map<string, HomeworkUnit>(
  ['i1', 'i2'].map((id) => [`hw:blk:${id}`, { assignmentItemId: 'hw', blockId: 'blk', itemId: id }]),
)

function Harness({ initial = {}, onChange }: { initial?: AnswerMap; onChange?: (k: string, v: unknown) => void }) {
  const [answers, setAnswers] = useState<AnswerMap>(initial)
  return (
    <InteractiveBlock
      block={block}
      ctx={{
        answers,
        onChange: (k, v) => {
          onChange?.(k, v)
          setAnswers((prev) => ({ ...prev, [k]: v }))
        },
        showResults: false,
        vocab: new Map(),
        itemId: 'hw',
        units,
      }}
    />
  )
}

const tray = () => screen.getByTestId('word-bank-tray')
const gaps = () => screen.getAllByTestId('gap')
const trayWord = (w: string) => within(tray()).getByRole('button', { name: w, hidden: true })

/** Exercise on screen, its own word box scrolled away: the tray should dock. */
function dock() {
  const exercise = screen.getByRole('group', { name: 'Word box' }).parentElement!
  setVisible(exercise, true)
  setVisible(screen.getByRole('group', { name: 'Word box' }), false)
}

beforeEach(() => {
  observers.length = 0
  vi.stubGlobal('IntersectionObserver', FakeIO)
  mockReducedMotion(false)
  Element.prototype.scrollIntoView = vi.fn()
})
afterEach(() => {
  vi.unstubAllGlobals()
})

describe('floating word bank', () => {
  it('docks only while the exercise is on screen and its word box is not', () => {
    render(<Harness />)
    expect(tray().hasAttribute('data-open')).toBe(false)
    expect(tray().getAttribute('aria-hidden')).toBe('true')

    dock()
    expect(tray().hasAttribute('data-open')).toBe(true)
    expect(screen.getByRole('region', { name: 'Word box' })).toBe(tray())
    expect(document.documentElement.dataset.wordbank).toBe('docked')

    setVisible(screen.getByRole('group', { name: 'Word box' }), true)
    expect(tray().hasAttribute('data-open')).toBe(false)

    setVisible(screen.getByRole('group', { name: 'Word box' }), false)
    setVisible(screen.getByRole('group', { name: 'Word box' }).parentElement!, false)
    expect(tray().hasAttribute('data-open')).toBe(false)
    expect(document.documentElement.dataset.wordbank).toBeUndefined()
  })

  it('fills the active gap, advances, announces, and moves used words', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Harness onChange={onChange} />)
    dock()
    expect(gaps()[0].hasAttribute('data-active')).toBe(true)

    await user.click(trayWord('kann'))
    expect(gaps()[0].textContent).toContain('kann')
    expect(onChange).toHaveBeenLastCalledWith('hw:blk:i1', { gaps: ['kann'] })
    expect(gaps()[1].hasAttribute('data-active')).toBe(true)
    expect(screen.getByTestId('gap-announcer').textContent).toContain('“kann” in gap 1')
    expect(trayWord('kann').hasAttribute('data-used')).toBe(true)
    expect(gaps()[1].scrollIntoView).toHaveBeenCalledWith({ block: 'nearest', behavior: 'smooth' })

    // A used word moves to the active gap.
    await user.click(trayWord('kann'))
    expect(gaps()[0].getAttribute('aria-label')).toBe('Gap 1 in item 1: empty')
    expect(gaps()[1].textContent).toContain('kann')
    expect(onChange).toHaveBeenCalledWith('hw:blk:i2', { gaps: ['kann', ''] })
    expect(gaps()[2].hasAttribute('data-active')).toBe(true)
  })

  it('tapping a gap makes it active; tapping a filled gap empties it', async () => {
    const user = userEvent.setup()
    render(<Harness initial={{ 'hw:blk:i1': { gaps: ['geht'] } }} />)
    dock()
    expect(gaps()[1].hasAttribute('data-active')).toBe(true)

    await user.click(gaps()[2])
    expect(gaps()[2].hasAttribute('data-active')).toBe(true)
    await user.click(trayWord('hat'))
    expect(gaps()[2].textContent).toContain('hat')
    expect(gaps()[1].hasAttribute('data-active')).toBe(true)

    await user.click(gaps()[0])
    expect(gaps()[0].getAttribute('aria-label')).toBe('Gap 1 in item 1: empty')
    expect(gaps()[0].hasAttribute('data-active')).toBe(true)
    expect(trayWord('geht').hasAttribute('data-used')).toBe(false)
    expect(screen.getByTestId('gap-announcer').textContent).toContain('Gap 1 cleared')
  })

  it('slides away once every gap is filled and works from the keyboard', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    dock()
    for (const w of ['geht', 'kann']) await user.click(trayWord(w))
    trayWord('hat').focus()
    await user.keyboard('{Enter}')
    expect(gaps().map((g) => g.textContent)).toEqual(['geht', 'kann', 'hat'])
    expect(tray().hasAttribute('data-open')).toBe(false)
    // Focus left the closing tray for the last gap it filled.
    expect(document.activeElement).toBe(gaps()[2])
  })

  it('respects reduced motion', async () => {
    mockReducedMotion(true)
    const user = userEvent.setup()
    render(<Harness />)
    dock()
    expect(tray().hasAttribute('data-reduced')).toBe(true)
    await user.click(trayWord('geht'))
    expect(gaps()[1].scrollIntoView).toHaveBeenCalledWith({ block: 'nearest', behavior: 'auto' })
  })

  it('shows no tray for gaps without a word box', () => {
    render(
      <InteractiveBlock
        block={{ ...block, wordBox: null }}
        ctx={{ answers: {}, onChange: () => {}, showResults: false, vocab: new Map(), itemId: 'hw', units }}
      />,
    )
    expect(screen.queryByTestId('word-bank-tray')).toBeNull()
    expect(screen.getAllByTestId('gap-input')).toHaveLength(3)
  })
})
