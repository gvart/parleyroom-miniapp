import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Avatar, Card, EmptyState, PageHeader, Pill } from '@/ui'
import { useUsers } from '@/hooks/useCreateLesson'
import { hueFor, initialsOf } from './avatarHue'

export function TeacherStudents() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const usersQuery = useUsers()
  const [q, setQ] = useState('')

  const students = useMemo(
    () => (usersQuery.data?.users ?? []).filter((u) => u.role === 'STUDENT'),
    [usersQuery.data],
  )
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    if (!needle) return students
    return students.filter((s) =>
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(needle),
    )
  }, [students, q])

  return (
    <div>
      <PageHeader
        eyebrow={t('students')}
        title={
          students.length === 1
            ? t('students_count_singular')
            : t('students_count', { count: students.length })
        }
      />

      <div style={{ padding: '0 16px 16px', position: 'relative' }}>
        <span
          className="ms"
          style={{
            position: 'absolute',
            left: 32,
            top: '50%',
            transform: 'translateY(calc(-50% - 8px))',
            fontSize: 20,
            color: 'var(--ink-3)',
            pointerEvents: 'none',
          }}
          aria-hidden="true"
        >
          search
        </span>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t('search_students')}
          aria-label={t('search_students')}
          className="glass-field"
          style={{ borderRadius: 999, paddingLeft: 46 }}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="person_search" title={t('no_students_found')} />
      ) : (
        <div style={{ padding: '0 16px' }}>
          <Card padded={false} className="row-list" style={{ overflow: 'hidden' }}>
            {filtered.map((s) => (
              <button
                type="button"
                key={s.id}
                onClick={() => navigate(`/students/${s.id}`)}
                className="row-btn"
              >
                <Avatar hue={hueFor(s.id)} initials={initialsOf(s)} size={42} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 'var(--text-card-title)', fontWeight: 800 }}>
                    {s.firstName} {s.lastName}
                  </div>
                  <div style={{ fontSize: 'var(--text-small)', fontWeight: 600, color: 'var(--ink-2)' }}>
                    {s.level ?? t('role_student')}
                  </div>
                </div>
                {s.level && <Pill tone="accent">{s.level}</Pill>}
                <span className="ms" style={{ fontSize: 20, color: 'var(--ink-3)' }} aria-hidden="true">
                  chevron_right
                </span>
              </button>
            ))}
          </Card>
        </div>
      )}
    </div>
  )
}
