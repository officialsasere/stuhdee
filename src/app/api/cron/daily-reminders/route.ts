import { sendNotificationService } from '@/features/notifications/services/send.service'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    // Verify cron secret (for security)
    const authHeader = request.headers.get('authorization')
    
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await sendNotificationService.sendDailyReminders()

    return NextResponse.json(result)
  } catch (error: unknown) {
    console.error('Daily reminders cron error:', error)
    const message = error instanceof Error ? error.message : 'Failed to send daily reminders'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}