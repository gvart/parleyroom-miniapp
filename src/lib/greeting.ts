/** Greeting key for the time of day in the device's time zone, with the portal's bounds (12:00, 18:00). */
export function greetingKey(now = new Date()): 'good_morning' | 'good_afternoon' | 'good_evening' {
  const hour = now.getHours()
  if (hour < 12) return 'good_morning'
  if (hour < 18) return 'good_afternoon'
  return 'good_evening'
}
