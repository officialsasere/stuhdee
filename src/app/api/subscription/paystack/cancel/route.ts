import { createClient } from '@/lib/supabase/server'
import { paystackClient } from '@/lib/paystack/client'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { subscriptionCode } = body

    if (!subscriptionCode) {
      return NextResponse.json({ error: 'Missing subscriptionCode' }, { status: 400 })
    }

    // Verify subscription belongs to user
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('stripe_subscription_id', subscriptionCode)
      .single()

    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    // Disable subscription in Paystack
    await paystackClient.disableSubscription(
      subscriptionCode,
      subscription.stripe_customer_id || ''
    )

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('Cancel subscription error:', error)
    const message = error instanceof Error ? error.message : 'Failed to cancel subscription'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}