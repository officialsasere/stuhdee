import { createClient } from '@/lib/supabase/server'

export const streakService = {
  /**
   * Calculate and update user's streak after completing a session
   */
  async updateStreak(userId: string) {
    const supabase = await createClient()
    
    // Get user's current streak data
    const { data: profile } = await supabase
      .from('profiles')
      .select('current_streak, longest_streak, last_completed_date')
      .eq('id', userId)
      .single()

    if (!profile) return

    const today = new Date().toISOString().split('T')[0]
    const lastCompleted = profile.last_completed_date

    let newStreak = profile.current_streak || 0
    let newLongest = profile.longest_streak || 0

    if (!lastCompleted) {
      // First completion ever
      newStreak = 1
    } else {
      const lastDate = new Date(lastCompleted)
      const todayDate = new Date(today)
      const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))

      if (diffDays === 0) {
        // Already completed today, no change
        return profile.current_streak
      } else if (diffDays === 1) {
        // Consecutive day
        newStreak = (profile.current_streak || 0) + 1
      } else {
        // Streak broken
        newStreak = 1
      }
    }

    // Update longest streak if current is higher
    if (newStreak > (profile.longest_streak || 0)) {
      newLongest = newStreak
    }

    // Update profile
    await supabase
      .from('profiles')
      .update({
        current_streak: newStreak,
        longest_streak: newLongest,
        last_completed_date: today,
      })
      .eq('id', userId)

    return newStreak
  },

  /**
   * Get user's streak info
   */
  async getStreak(userId: string) {
    const supabase = await createClient()
    
    const { data } = await supabase
      .from('profiles')
      .select('current_streak, longest_streak, last_completed_date')
      .eq('id', userId)
      .single()

    return {
      current: data?.current_streak || 0,
      longest: data?.longest_streak || 0,
      lastCompleted: data?.last_completed_date,
    }
  }
}