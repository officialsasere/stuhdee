import { AuthError } from '@supabase/supabase-js'

export function getAuthErrorMessage(error: unknown): string {
  if (!(error instanceof AuthError)) {
    return 'Something went wrong. Please try again.'
  }

  const msg = error.message.toLowerCase()

  if (msg.includes('invalid login credentials')) {
    return 'Incorrect email or password. Please try again.'
  }

  if (msg.includes('email not confirmed')) {
    return 'Please verify your email before signing in.'
  }

  if (msg.includes('user already registered')) {
    return 'An account with this email already exists. Please sign in.'
  }

  if (msg.includes('rate limit')) {
    return 'Too many attempts. Please wait a few minutes and try again.'
  }

  return 'Unable to sign in. Please try again later.'
}
    