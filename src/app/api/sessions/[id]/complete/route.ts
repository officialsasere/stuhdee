import { sessionService } from '@/features/sessions/services/session.services'
import { getSessionErrorMessage } from '@/lib/errors'
import { createClient } from '@/lib/supabase/server'

import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {

  const { id } = await params;
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const sessionId = id
    const session = await sessionService.completeSession(sessionId, user.id)

    return NextResponse.json(session)
  } catch (error) {
    console.error('Complete session error:', error)
    return NextResponse.json(
      { error: getSessionErrorMessage(error) || 'Failed to complete session' },
      { status: 500 }
    )
  }
}