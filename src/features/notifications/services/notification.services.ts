import { createClient } from '@/lib/supabase/server'

export const notificationService = {
  /**
   * Save FCM token for user
   */
  async saveFCMToken(userId: string, token: string) {
    const supabase = await createClient()
    
    const { error } = await supabase
      .from('profiles')
      .update({ fcm_token: token })
      .eq('id', userId)
    
    if (error) throw error
  },

  /**
   * Get user's FCM token
   */
  async getFCMToken(userId: string) {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('profiles')
      .select('fcm_token')
      .eq('id', userId)
      .single()
    
    if (error) throw error
    return data?.fcm_token
  }
}