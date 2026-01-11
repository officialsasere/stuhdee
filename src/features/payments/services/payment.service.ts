import { createAdminClient } from '@/lib/supabase/admin'


export const paymentService = {
  /**
   * Create or update subscription record
   */
  async upsertSubscription(
    userId: string,
    data: {
      stripe_customer_id?: string
      stripe_subscription_id?: string
      status: string
      plan_type?: string
      current_period_start?: string
      current_period_end?: string
    }
  ) {
    
    const supabase = createAdminClient()
    
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: userId,
        ...data,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      })
      .select()
      .single()
    
    if (error) throw error
    return subscription
  },

  /**
   * Mark trial as used
   */
  async markTrialAsUsed(userId: string) {
    const supabase =  createAdminClient()
    
    const { error } = await supabase
      .from('profiles')
      .update({ trial_used: true })
      .eq('id', userId)
    
    if (error) throw error
  },

  /**
   * Get user subscription
   */
  async getSubscription(userId: string) {
    const supabase = createAdminClient()
    
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data
  },
}