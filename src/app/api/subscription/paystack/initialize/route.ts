import { createClient } from '@/lib/supabase/server'
import { paystackClient } from '@/lib/paystack/client'
import { PAYSTACK_PLANS } from '@/lib/paystack/config'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { planType } = body

    if (!planType || !(planType in PAYSTACK_PLANS)) {
      return NextResponse.json({ error: 'Invalid plan type' }, { status: 400 })
    }

    const plan = PAYSTACK_PLANS[planType as keyof typeof PAYSTACK_PLANS]

    // Get user email
    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', user.id)
      .single()

    const email = profile?.email || user.email
    if (!email) {
      return NextResponse.json({ error: 'User email not found' }, { status: 400 })
    }

    // Initialize Paystack transaction
    const response = await paystackClient.initializeTransaction({
      email,
      amount: plan.amount,
      plan: plan.planCode,
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/subscription/paystack/callback`,
      metadata: {
        user_id: user.id,
        plan_type: planType,
        cancel_action: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      },
    })

    // Create pending transaction record
    await supabase.from('transactions').insert({
      user_id: user.id,
      reference: response.data.reference,
      amount: plan.amount,
      currency: 'NGN',
      status: 'pending',
      plan_type: planType,
    })

    return NextResponse.json({
      authorization_url: response.data.authorization_url,
      reference: response.data.reference,
    })
  } catch (error: unknown) {
    console.error('Initialize payment error:', error)
    const message = error instanceof Error ? error.message : 'Failed to initialize payment'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}