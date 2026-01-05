import { createClient } from '@/lib/supabase/server'
import { streakService } from './streak.service'

export const sessionService = {
  /**
   * Mark session as completed
   */
  async completeSession(sessionId: string, userId: string) {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('study_sessions')
      .update({
        completed: true,
        completed_at: new Date().toISOString(),
      })
      .eq('id', sessionId)
      .eq('user_id', userId)
      .select()
      .single()
    
    if (error) throw error

     // Update streak
    await streakService.updateStreak(userId)

    return data
  },

  /**
   * Get user's sessions for a date range
   */
  async getSessions(userId: string, startDate: string, endDate: string) {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('study_sessions')
      .select('*, courses(course_name)')
      .eq('user_id', userId)
      .gte('session_date', startDate)
      .lte('session_date', endDate)
      .order('session_date', { ascending: true })
    
    if (error) throw error
    return data
  }
}