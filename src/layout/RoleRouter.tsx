import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '@/auth/AuthGate'
import { AppShell } from './AppShell'
import { STUDENT_TABS, TEACHER_TABS } from './tabs'
import { Home } from '@/features/student/Home'
import { Lessons } from '@/features/student/Lessons'
import { Homework } from '@/features/student/Homework'
import { Vocab } from '@/features/student/Vocab'
import { VocabReview } from '@/features/student/VocabReview'
import { Goals } from '@/features/student/Goals'
import { Calendar } from '@/features/student/Calendar'
import { Notifications } from '@/features/shared/Notifications'
import { Settings } from '@/features/shared/Settings'
import { ProfileEdit } from '@/features/shared/ProfileEdit'
import { TeacherHome } from '@/features/teacher/TeacherHome'
import { TeacherStudents } from '@/features/teacher/Students'
import { StudentProfile } from '@/features/teacher/StudentProfile'

export function RoleRouter() {
  const { user } = useAuth()

  if (user.role === 'TEACHER') {
    return (
      <AppShell tabs={TEACHER_TABS}>
        <Routes>
          <Route path="/" element={<TeacherHome />} />
          <Route path="/students" element={<TeacherStudents />} />
          <Route path="/students/:id" element={<StudentProfile />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/notifications" element={<Notifications />} />
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
        <Route path="/vocab/review" element={<VocabReview />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/settings/profile" element={<ProfileEdit />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  )
}
