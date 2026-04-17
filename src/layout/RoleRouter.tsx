import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '@/auth/AuthGate'
import { AppShell } from './AppShell'
import { STUDENT_TABS, TEACHER_TABS } from './tabs'
import { Home } from '@/features/student/Home'
import { Lessons } from '@/features/student/Lessons'
import { Homework } from '@/features/student/Homework'
import { Vocab } from '@/features/student/Vocab'
import { Settings } from '@/features/shared/Settings'
import { ProfileEdit } from '@/features/shared/ProfileEdit'
import { TeacherStub } from '@/features/teacher/TeacherStub'

export function RoleRouter() {
  const { user } = useAuth()

  if (user.role === 'TEACHER') {
    return (
      <AppShell tabs={TEACHER_TABS}>
        <Routes>
          <Route path="/" element={<TeacherStub />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/settings/profile" element={<ProfileEdit />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell>
    )
  }

  return (
    <AppShell tabs={STUDENT_TABS}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/lessons" element={<Lessons />} />
        <Route path="/homework" element={<Homework />} />
        <Route path="/vocab" element={<Vocab />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/settings/profile" element={<ProfileEdit />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  )
}
