import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '@/auth/AuthGate'
import { AppShell } from './AppShell'
import { STUDENT_TABS, TEACHER_TABS } from './tabs'
import { Home } from '@/features/student/Home'
import { Lessons } from '@/features/student/Lessons'
import { Homework } from '@/features/student/Homework'
import { HomeworkDetail } from '@/features/student/homework/HomeworkDetail'
import { Vocab } from '@/features/student/Vocab'
import { PracticeHome } from '@/features/student/practice/PracticeHome'
import { PracticeSession } from '@/features/student/practice/PracticeSession'
import { Goals } from '@/features/student/Goals'
import { Calendar } from '@/features/student/Calendar'
import { LessonLive } from '@/features/student/LessonLive'
import { Notifications } from '@/features/shared/Notifications'
import { Settings } from '@/features/shared/Settings'
import { ProfileEdit } from '@/features/shared/ProfileEdit'
import { ChangePassword } from '@/features/shared/ChangePassword'
import { InterfaceLanguage } from '@/features/shared/InterfaceLanguage'
import { TranslationLanguage } from '@/features/shared/TranslationLanguage'
import { Appearance } from '@/features/shared/Appearance'
import { TeacherHome } from '@/features/teacher/TeacherHome'
import { TeacherStudents } from '@/features/teacher/Students'
import { StudentProfile } from '@/features/teacher/StudentProfile'
import { Materials } from '@/features/teacher/Materials'
import { StudentMaterials } from '@/features/student/Materials'

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
          <Route path="/materials" element={<Materials />} />
          <Route path="/lessons/:id/live" element={<LessonLive />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/settings/profile" element={<ProfileEdit />} />
          <Route path="/settings/password" element={<ChangePassword />} />
          <Route path="/settings/language" element={<InterfaceLanguage />} />
          <Route path="/settings/appearance" element={<Appearance />} />
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
        <Route path="/lessons/:id/live" element={<LessonLive />} />
        <Route path="/homework" element={<Homework />} />
        <Route path="/homework/:id" element={<HomeworkDetail />} />
        <Route path="/materials" element={<StudentMaterials />} />
        <Route path="/vocab" element={<Vocab />} />
        <Route path="/vocab/practice" element={<PracticeHome />} />
        <Route path="/vocab/practice/session" element={<PracticeSession />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/settings/profile" element={<ProfileEdit />} />
        <Route path="/settings/password" element={<ChangePassword />} />
        <Route path="/settings/language" element={<InterfaceLanguage />} />
        <Route path="/settings/appearance" element={<Appearance />} />
        <Route path="/settings/translation-language" element={<TranslationLanguage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  )
}
