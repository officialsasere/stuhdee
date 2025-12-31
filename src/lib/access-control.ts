import { createClient } from '@/lib/supabase/server'

export type AccessStatus = {
  hasAccess: boolean
  status: 'trial' | 'trial_expired' | 'active' | 'inactive'
  daysRemaining?: number
}

export async function checkUserAccess(userId: string): Promise<AccessStatus> {
  const supabase = await createClient()
  
  // Get profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (!profile) {
    return { hasAccess: false, status: 'inactive' }
  }

  // Check trial
  const trialEndsAt = profile.trial_ends_at ? new Date(profile.trial_ends_at) : new Date()
  const today = new Date()
  const daysRemaining = Math.ceil((trialEndsAt.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  
  if (daysRemaining > 0 && !profile.trial_used) {
    return { 
      hasAccess: true, 
      status: 'trial',
      daysRemaining 
    }
  }

  if (daysRemaining <= 0 && !profile.trial_used) {
    return { 
      hasAccess: false, 
      status: 'trial_expired' 
    }
  }

  // Check subscription
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (subscription && subscription.status === 'active') {
    const periodEnd = new Date(subscription.current_period_end || '')
    if (periodEnd > today) {
      return { hasAccess: true, status: 'active' }
    }
  }

  return { hasAccess: false, status: 'inactive' }
}