import { createClient } from '@/lib/supabase/server'

export type UpdateProfileInput = {
  full_name?: string
  notification_enabled?: boolean
  notification_time?: string
  timezone?: string
}

export const userService = {
  /**
   * Get user profile
   */
  async getProfile(userId: string) {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) throw error
    return data
  },

  /**
   * Update user profile
   */
  async updateProfile(userId: string, input: UpdateProfileInput) {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('profiles')
      .update(input)
      .eq('id', userId)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}