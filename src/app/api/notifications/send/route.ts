import { createClient } from '@/lib/supabase/server'
import { sendNotificationService } from '@/features/notifications/services/send.service'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, body } = await request.json()

    if (!title || !body) {
      return NextResponse.json({ error: 'Missing title or body' }, { status: 400 })
    }

    await sendNotificationService.sendToUser(user.id, title, body)

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('Send notification error:', error)
    const message = error instanceof Error ? error.message : 'Failed to send notification'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}