import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Avatar, Card } from '@/ui'
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
      <div style={{ padding: '8px 16px 14px' }}>
        <div className="eyebrow" style={{ marginBottom: 6 }}>
          {t('students')}
        </div>
        <div
          className="font-headline"
          style={{ fontSize: 'var(--text-page-title)', lineHeight: 1.05 }}
        >
          {students.length === 1
            ? t('students_count_singular')
            : t('students_count', { count: students.length })}
          
        </div>
      </div>

      <div style={{ padding: '0 16px 14px' }}>
        <div
          style={{
            display: 'flex',
            gap: 10,
            alignItems: 'center',
            background: 'var(--card)',
            border: '1px solid var(--hair)',
            borderRadius: 999,
            padding: '10px 16px',
          }}
        >
          <span className="ms" style={{ fontSize: 18, color: 'var(--ink-3)' }}>
            search
          </span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t('search_students')}
            style={{
              flex: 1,
              border: 0,
              outline: 0,
              background: 'transparent',
              fontSize: 14,
              color: 'var(--ink)',
              fontFamily: 'inherit',
            }}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={{ padding: '40px 30px', textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 10 }}>◌</div>
          <div className="section-title" style={{ color: 'var(--ink-2)' }}>
            {t('no_students_found')}
          </div>
        </div>
      ) : (
        <div style={{ padding: '0 16px' }}>
          <Card padded={false}>
            {filtered.map((s, i) => (
              <button
                type="button"
                key={s.id}
                onClick={() => navigate(`/students/${s.id}`)}
                className="tap"
                style={{
                  width: '100%',
                  border: 0,
                  background: 'transparent',
                  color: 'var(--ink)',
                  textAlign: 'left',
                  padding: '14px 18px',
                  borderBottom: i < filtered.length - 1 ? '1px solid var(--hair)' : 0,
                  display: 'flex',
                  gap: 12,
                  alignItems: 'center',
                  cursor: 'pointer',
                }}
              >
                <Avatar hue={hueFor(s.id)} initials={initialsOf(s)} size={40} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>
                    {s.firstName} {s.lastName}
                  </div>
                  <div style={{ fontSize: 'var(--text-caption)', color: 'var(--ink-2)' }}>
                    {s.level ?? t('role_student')}
                  </div>
                </div>
                <span className="ms" style={{ fontSize: 20, color: 'var(--ink-3)' }}>
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
