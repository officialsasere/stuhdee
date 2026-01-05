import { adminMessaging } from '@/lib/firebase/admin'
import { createClient } from '@/lib/supabase/server'

export const sendNotificationService = {
  /**
   * Send notification to single user
   */
  async sendToUser(userId: string, title: string, body: string) {
    const supabase = await createClient()
    
    // Get user's FCM token
    const { data: profile } = await supabase
      .from('profiles')
      .select('fcm_token, notification_enabled')
      .eq('id', userId)
      .single()

    if (!profile?.fcm_token || !profile.notification_enabled) {
      console.log('User has no FCM token or notifications disabled')
      return null
    }

    try {
      const message = {
        notification: {
          title,
          body,
        },
        token: profile.fcm_token,
      }

      const response = await adminMessaging.send(message)
      console.log('Notification sent:', response)
      return response
    } catch (error: unknown) {
      console.error('Error sending notification:', error)
      
      // If token is invalid, remove it from database
      if (error instanceof Error && error.message.includes('registration-token-not-registered')) {
        await supabase
          .from('profiles')
          .update({ fcm_token: null })
          .eq('id', userId)
      }
      
      throw error
    }
  },

  /**
   * Send daily study reminders to all users
   */
  async sendDailyReminders() {
    const supabase = await createClient()
    
    // Get today's date
    const today = new Date().toISOString().split('T')[0]
    
    // Get all users with sessions today and notifications enabled
    const { data: sessions } = await supabase
      .from('study_sessions')
      .select('user_id, topic, courses(course_name), profiles!inner(fcm_token, notification_enabled)')
      .eq('session_date', today)
      .eq('completed', false)
      .not('profiles.fcm_token', 'is', null)
      .eq('profiles.notification_enabled', true)

    if (!sessions || sessions.length === 0) {
      console.log('No users to notify today')
      return { sent: 0, failed: 0 }
    }

    // Group by user
    const userSessions = sessions.reduce((acc, session) => {
      if (!acc[session.user_id]) {
        acc[session.user_id] = []
      }
      acc[session.user_id].push(session)
      return acc
    }, {} as Record<string, typeof sessions>)

    let sent = 0
    let failed = 0

    // Send notification to each user
    for (const [userId, userSessionsList] of Object.entries(userSessions)) {
      try {
        const sessionCount = userSessionsList.length
        const firstSession = userSessionsList[0]
        
        const title = '📚 Time to Study!'
        const body = sessionCount === 1
          ? `${firstSession.courses?.course_name} - ${firstSession.topic}`
          : `You have ${sessionCount} study sessions today`

        await this.sendToUser(userId, title, body)
        sent++
      } catch (error: unknown) {
        console.error(`Failed to send to user ${userId}:`, error)
        failed++
      }
    }

    console.log(`Daily reminders sent: ${sent} successful, ${failed} failed`)
    return { sent, failed }
  }
}