import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import type { MyGoalResponse, StudentGoal, UserProfile } from '@/api/types'
import { api } from '@/api/endpoints'
import { Goals } from './Goals'
import { GoalHomeCard } from './goal/GoalHomeCard'

const auth = vi.hoisted(() => ({ user: {} as Partial<UserProfile> }))

vi.mock('@/auth/AuthGate', () => ({ useAuth: () => auth }))
vi.mock('@/api/endpoints', () => ({
  api: { myGoal: vi.fn(), selfAssessMilestone: vi.fn() },
}))

const myGoal = vi.mocked(api.myGoal)
const selfAssess = vi.mocked(api.selfAssessMilestone)

const onTrack: StudentGoal = {
  id: 'g1',
  title: 'telc B1',
  deadline: '2026-12-15',
  progressPercent: 38,
  status: 'ON_TRACK',
  milestones: [1, 2, 3, 4, 5, 6, 7].map((position) => ({
    id: `m${position}`,
    position,
    done: position < 3,
    current: position === 3,
  })),
  currentCanDo: 'Ich kann über meinen Alltag sprechen.',
  nextCanDo: 'Ich kann eine E-Mail schreiben.',
  coveredTitles: ['Sich vorstellen', 'Wohnen'],
  pendingSelfAssessment: null,
}

function renderAt(path: string, ui = <Goals />) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/" element={<div>home screen</div>} />
          <Route path="/goals" element={ui} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('student goal view', () => {
  beforeEach(() => {
    auth.user = { role: 'STUDENT', features: { roadmap: true } }
    myGoal.mockReset()
    selfAssess.mockReset()
  })

  it('stays away from the goal API while the roadmap flag is off', async () => {
    auth.user = { role: 'STUDENT', features: { roadmap: false } }
    renderAt('/goals')
    expect(await screen.findByText('home screen')).toBeTruthy()
    expect(myGoal).not.toHaveBeenCalled()
  })

  it('shows an empty state without an active goal', async () => {
    myGoal.mockResolvedValue({ goal: null })
    renderAt('/goals')
    expect(await screen.findByText('No learning goal yet')).toBeTruthy()
    expect(screen.queryByRole('img')).toBeNull()
  })

  it('tells the student the plan is coming while there is no roadmap', async () => {
    myGoal.mockResolvedValue({
      goal: { ...onTrack, status: 'NO_ROADMAP', progressPercent: null, milestones: [], currentCanDo: null, nextCanDo: null, coveredTitles: [] },
    })
    renderAt('/goals')
    expect(await screen.findByText('Your teacher is preparing your plan')).toBeTruthy()
    expect(screen.queryByRole('img', { name: /Milestone/ })).toBeNull()
    expect(screen.queryByText("You're on track")).toBeNull()
  })

  it('shows the path, status and what the student works on, with covered milestones collapsed', async () => {
    myGoal.mockResolvedValue({ goal: onTrack })
    renderAt('/goals')
    expect(await screen.findByRole('img', { name: 'Milestone 3 of 7' })).toBeTruthy()
    expect(screen.getByText("You're on track")).toBeTruthy()
    expect(screen.getByText('Ich kann über meinen Alltag sprechen.')).toBeTruthy()
    expect(screen.getByText('Ich kann eine E-Mail schreiben.')).toBeTruthy()

    const covered = screen.getByRole('button', { name: /What we have covered/ })
    expect(covered.getAttribute('aria-expanded')).toBe('false')
    expect(screen.queryByText('Sich vorstellen')).toBeNull()
    await userEvent.click(covered)
    expect(covered.getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByText('Sich vorstellen')).toBeTruthy()
  })

  it('submits a pending self-assessment with an optional comment', async () => {
    const pending = { milestoneId: 'm2', canDo: 'Ich kann meine Wohnung beschreiben.' }
    myGoal.mockResolvedValue({ goal: { ...onTrack, pendingSelfAssessment: pending } })
    selfAssess.mockResolvedValue({ goal: onTrack } satisfies MyGoalResponse)
    renderAt('/goals')

    expect(await screen.findByText('Does this match how you feel?')).toBeTruthy()
    expect(screen.getByText(pending.canDo)).toBeTruthy()
    const send = screen.getByRole('button', { name: 'Send answer' })
    expect((send as HTMLButtonElement).disabled).toBe(true)

    await userEvent.click(screen.getByRole('button', { name: 'Partly' }))
    expect(screen.getByRole('button', { name: 'Partly' }).getAttribute('aria-pressed')).toBe('true')
    await userEvent.type(screen.getByRole('textbox'), 'Modalverben noch schwer')
    await userEvent.click(send)

    await waitFor(() =>
      expect(selfAssess).toHaveBeenCalledWith('m2', { answer: 'PARTLY', comment: 'Modalverben noch schwer' }),
    )
    expect(await screen.findByText('Thanks! Your teacher will see your answer.')).toBeTruthy()
    expect(screen.queryByText('Does this match how you feel?')).toBeNull()
  })
})

describe('home goal card', () => {
  it('shows the path, the current can-do and a nudge to self-assess', () => {
    renderAt(
      '/goals',
      <GoalHomeCard goal={{ ...onTrack, pendingSelfAssessment: { milestoneId: 'm2', canDo: 'x' } }} />,
    )
    expect(screen.getByRole('img', { name: 'Milestone 3 of 7' })).toBeTruthy()
    expect(screen.getByText('Ich kann über meinen Alltag sprechen.')).toBeTruthy()
    expect(screen.getByText('A milestone is done – does it feel that way?')).toBeTruthy()
  })

  it('shows "all done" once every milestone is done', () => {
    const allDone = onTrack.milestones.map((m) => ({ ...m, done: true, current: false }))
    renderAt('/goals', <GoalHomeCard goal={{ ...onTrack, milestones: allDone, currentCanDo: null }} />)
    expect(screen.getByRole('img', { name: 'All milestones done' })).toBeTruthy()
  })
})
