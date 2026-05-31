import type { Session, User as SupabaseUser } from '@supabase/supabase-js'
import { supabase } from './supabase'
import type { User } from '../types/index'
import { traceAwait } from './syncTrace'

export type ProfileRecord = {
  id: string
  name: string
  created_at?: string
  onboarding_completed?: boolean
  goal?: string | null
}

export function displayNameFromAuthUser(user: SupabaseUser, fallback = 'User'): string {
  return (
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split('@')[0] ||
    fallback
  )
}

export async function fetchProfile(userId: string): Promise<ProfileRecord | null> {
  const { data, error } = await traceAwait('fetchProfile', () =>
    supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
  )

  if (error) {
    if (import.meta.env.DEV) {
      console.error('Failed to fetch profile:', error)
    }
    return null
  }

  return (data as ProfileRecord | null) ?? null
}

export async function ensureProfile(userId: string, name: string): Promise<ProfileRecord | null> {
  const existing = await fetchProfile(userId)
  if (existing) {
    return existing
  }

  const createdAt = new Date().toISOString()
  const { data, error } = await traceAwait('profiles.insert', () =>
    supabase
      .from('profiles')
      .insert({
        id: userId,
        name,
        onboarding_completed: false,
        created_at: createdAt,
      })
      .select('*')
      .single()
  )

  if (error) {
    if (import.meta.env.DEV) {
      console.error('Failed to create profile:', error)
    }
    return null
  }

  return data as ProfileRecord
}

export function profileToAppUser(session: Session, profile: ProfileRecord | null): User {
  const authUser = session.user
  return {
    id: authUser.id,
    email: authUser.email!,
    name: profile?.name || displayNameFromAuthUser(authUser),
  }
}

export function isOnboardingComplete(profile: ProfileRecord | null): boolean {
  return profile?.onboarding_completed === true
}

export function getPostAuthPath(onboardingCompleted: boolean): '/dashboard' | '/onboarding' {
  return onboardingCompleted ? '/dashboard' : '/onboarding'
}
