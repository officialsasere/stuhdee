import type { Tables } from '@/types/database'

export type Profile = Tables<'profiles'>

export type UpdateProfileInput = {
  full_name?: string
  notification_enabled?: boolean
  notification_time?: string
  timezone?: string
}