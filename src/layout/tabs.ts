import type { TabDef } from '@/ui'

// Home · Calendar · Words · Homework · You. Lessons list and Library aren't
// tabs — they're reachable from Home (quick links) and You (Settings).
export const STUDENT_TABS: TabDef[] = [
  { key: 'home', path: '/', labelKey: 'tab_home', icon: 'home' },
  { key: 'calendar', path: '/calendar', labelKey: 'calendar', icon: 'calendar_today' },
  { key: 'vocab', path: '/vocab', labelKey: 'tab_words', icon: 'menu_book' },
  { key: 'homework', path: '/homework', labelKey: 'homework', icon: 'edit_note' },
  { key: 'settings', path: '/settings', labelKey: 'tab_you', icon: 'person' },
]

export const TEACHER_TABS: TabDef[] = [
  { key: 'home', path: '/', labelKey: 'tab_today', icon: 'today' },
  { key: 'students', path: '/students', labelKey: 'students', icon: 'groups' },
  { key: 'calendar', path: '/calendar', labelKey: 'calendar', icon: 'calendar_today' },
  { key: 'materials', path: '/materials', labelKey: 'tab_library', icon: 'collections_bookmark' },
  { key: 'settings', path: '/settings', labelKey: 'tab_you', icon: 'person' },
]
