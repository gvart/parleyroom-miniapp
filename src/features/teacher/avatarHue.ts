const HUES = [172, 290, 75, 25, 210, 145, 60, 330]

export function hueFor(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % HUES.length
  return HUES[h]
}

export function initialsOf(u: {
  initials?: string | null
  firstName: string
  lastName: string
}): string {
  if (u.initials) return u.initials
  return `${u.firstName[0] ?? ''}${u.lastName[0] ?? ''}`.toUpperCase()
}
