const PREFS_KEY = 'daylock-preferences'

export type UserPreferences = {
  notificationsEnabled: boolean
  reminderTime: string
}

const DEFAULT_PREFS: UserPreferences = {
  notificationsEnabled: true,
  reminderTime: '9:00 PM',
}

export function loadPreferences(): UserPreferences {
  try {
    const raw = localStorage.getItem(PREFS_KEY)
    if (!raw) return { ...DEFAULT_PREFS }
    return { ...DEFAULT_PREFS, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULT_PREFS }
  }
}

export function savePreferences(prefs: UserPreferences): void {
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs))
}
