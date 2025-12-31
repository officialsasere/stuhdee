import { createClient } from '@/lib/supabase/server'
import { userService } from '@/features/user/services/user.service'
import { NextResponse } from 'next/server'

export async function PUT(request: Request) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { full_name, notification_enabled, notification_time } = body

    const profile = await userService.updateProfile(user.id, {
      full_name,
      notification_enabled,
      notification_time,
    })

    return NextResponse.json(profile)
  } catch (error: unknown) {
    console.error('Update profile error:', error)
    const message = error instanceof Error ? error.message : 'Failed to update profile'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}