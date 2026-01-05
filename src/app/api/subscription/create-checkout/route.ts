import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { paystackClient } from '@/lib/paystack/client'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { planCode, planType, amount } = await request.json()

    if (!planCode || !planType || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get user email
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.email) {
      return NextResponse.json(
        { error: 'User email not found' },
        { status: 400 }
      )
    }

    // Initialize Paystack transaction
    const paystackResponse = await paystackClient.initializeTransaction({
      email: profile.email,
      amount, // IN KOBO
      plan: planCode, // <-- this links the subscription
      callback_url: `${
        process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
      }/dashboard`,
      metadata: {
        user_id: user.id,
        plan_type: planType,
      },
    })

    return NextResponse.json({
      url: paystackResponse.data.authorization_url,
    })
  } catch (error: unknown) {
    console.error('Paystack checkout error:', error)
    const message =
      error instanceof Error ? error.message : 'Failed to start payment'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
