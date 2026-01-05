import { notificationService } from '@/features/notifications/services/notification.services'
import { createClient } from '@/lib/supabase/server'

import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: 'Missing token' }, { status: 400 })
    }

    await notificationService.saveFCMToken(user.id, token)

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('Register token error:', error)
    const message = error instanceof Error ? error.message : 'Failed to register token'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}