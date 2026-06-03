import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines classnames using clsx and merges Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Returns a greeting based on the current hour
 */
export function getGreeting(): string {
  const hour = new Date().getHours();

  if (hour < 12) {
    return 'Good Morning';
  } else if (hour < 18) {
    return 'Good Afternoon';
  } else {
    return 'Good Evening';
  }
}

/**
 * Formats a date to "Friday, May 29" format
 */
export function formatDate(date: Date = new Date()): string {
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

/**
 * Returns the current day name
 */
export function getDayName(date: Date = new Date()): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
}

/**
 * Get the last date the app was reset (midnight)
 */
export function getLastResetDate(): string | null {
  return localStorage.getItem('daylock-last-reset');
}

/**
 * Set the last reset date to today
 */
export function setLastResetDate(): void {
  const today = new Date().toDateString();
  localStorage.setItem('daylock-last-reset', today);
}

/**
 * Check if the app should reset (new day)
 */
export function shouldReset(): boolean {
  const lastReset = getLastResetDate();
  const today = new Date().toDateString();
  return lastReset !== today;
}

/**
 * Convert 12-hour format (e.g., "6:00 PM") to 24-hour format (e.g., "18:00")
 * Accepts "6:00 PM", "6 PM" (minutes default to "00"), or "6:00 pm"
 * Returns empty string if input is empty or invalid
 */
export function formatTo24Hour(time12: string): string {
  if (!time12 || !time12.trim()) return '';

  const match = time12.trim().toLowerCase().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/)
  if (!match) return ''

  let hours = parseInt(match[1], 10)
  const minutes = match[2] ?? '00'
  const period = match[3]

  if (period === 'pm' && hours !== 12) {
    hours += 12
  } else if (period === 'am' && hours === 12) {
    hours = 0
  }

  return `${String(hours).padStart(2, '0')}:${minutes}`
}

/**
 * Convert 12-hour format to minutes since midnight.
 * Returns null if input is empty or invalid.
 */
export function parseTimeToMinutes(input: string): number | null {
  const hours24 = formatTo24Hour(input)
  if (!hours24) return null
  const [h, m] = hours24.split(':').map(Number)
  return h * 60 + m
}

/**
 * Convert 24-hour format (e.g., "18:00") to 12-hour format (e.g., "6:00 PM")
 * Returns empty string if input is empty
 */
export function formatTo12Hour(time24: string): string {
  if (!time24 || !time24.trim()) return '';

  const match = time24.trim().match(/^(\d{1,2}):(\d{2})$/)
  if (!match) return ''

  let hours = parseInt(match[1], 10)
  const minutes = match[2]

  const period = hours >= 12 ? 'PM' : 'AM'
  if (hours > 12) {
    hours -= 12
  } else if (hours === 0) {
    hours = 12
  }

  return `${hours}:${minutes} ${period}`
}
