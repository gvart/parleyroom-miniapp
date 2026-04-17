import type { TabDef } from '@/ui'

export const STUDENT_TABS: TabDef[] = [
  { key: 'home', path: '/', label: 'Home', icon: 'home' },
  { key: 'lessons', path: '/lessons', label: 'Lessons', icon: 'event_note' },
  { key: 'homework', path: '/homework', label: 'Tasks', icon: 'task_alt' },
  { key: 'vocab', path: '/vocab', label: 'Words', icon: 'menu_book' },
  { key: 'settings', path: '/settings', label: 'You', icon: 'person' },
]

export const TEACHER_TABS: TabDef[] = [
  { key: 'home', path: '/', label: 'Today', icon: 'today' },
  { key: 'students', path: '/students', label: 'Students', icon: 'groups' },
  { key: 'calendar', path: '/calendar', label: 'Calendar', icon: 'calendar_today' },
  { key: 'materials', path: '/materials', label: 'Library', icon: 'collections_bookmark' },
  { key: 'settings', path: '/settings', label: 'You', icon: 'person' },
]
