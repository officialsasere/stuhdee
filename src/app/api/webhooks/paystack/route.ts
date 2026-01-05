import { createClient } from '@/lib/supabase/server'

import { NextResponse } from 'next/server'
import crypto from 'crypto'
import type { PaystackWebhookEvent } from '@/lib/paystack/types'
import { paymentService } from '@/features/payments/services/payment.service'

export async function POST(request: Request) {
   console.log('🚀 PAYSTACK WEBHOOK HIT')
  try {
    const body = await request.text()
      console.log('📦 RAW BODY:', body)
    const signature = request.headers.get('x-paystack-signature')

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }

    // Verify signature
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
      .update(body)
      .digest('hex')

    if (hash !== signature) {
      console.error('Invalid webhook signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const event: PaystackWebhookEvent = JSON.parse(body)
    console.log('Paystack webhook event:', event.event)

    switch (event.event) {
      case 'charge.success': {
        await handleChargeSuccess(event)
        break
      }

      case 'subscription.disable': {
        await handleSubscriptionDisable(event)
        break
      }

      case 'subscription.not_renew': {
        await handleSubscriptionNotRenew(event)
        break
      }

      default:
        console.log('Unhandled webhook event:', event.event)
    }

    return NextResponse.json({ received: true })
  } catch (error: unknown) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handleChargeSuccess(event: PaystackWebhookEvent) {
  const { metadata, customer, subscription, reference, amount, status } = event.data
  const supabase = await createClient()

  if (!metadata?.user_id) {
    console.warn('No user_id in webhook metadata')
    return
  }

  // Update transaction record
  await supabase
    .from('transactions')
    .update({
      status: status === 'success' ? 'success' : 'failed',
      payment_method: 'paystack',
      paystack_data: JSON.parse(JSON.stringify(event.data))
    })
    .eq('reference', reference || '')

  // For subscription payments
  if (subscription?.subscription_code && customer && status === 'success') {
    const now = new Date()
    const periodEnd = new Date(now)
    
    // Calculate period end based on plan interval
    if (subscription.plan?.interval === 'monthly') {
      periodEnd.setMonth(periodEnd.getMonth() + 1)
    } else if (subscription.plan?.interval === 'quarterly') {
      periodEnd.setMonth(periodEnd.getMonth() + 3)
    } else {
      periodEnd.setDate(periodEnd.getDate() + 30)
    }

    await paymentService.upsertSubscription(metadata.user_id, {
      stripe_customer_id: customer.customer_code,
      stripe_subscription_id: subscription.subscription_code,
      status: 'active',
      plan_type: metadata.plan_type,
      current_period_start: now.toISOString(),
      current_period_end: periodEnd.toISOString(),
    })

    // Mark trial as used
    await paymentService.markTrialAsUsed(metadata.user_id)
  }
}

async function handleSubscriptionDisable(event: PaystackWebhookEvent) {
  const { subscription_code, customer } = event.data

  if (!subscription_code || !customer?.customer_code) {
    console.warn('Missing subscription_code or customer_code')
    return
  }

  const supabase = await createClient()
  const { data } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', customer.customer_code)
    .single()

  if (data?.user_id) {
    await paymentService.upsertSubscription(data.user_id, {
      stripe_subscription_id: subscription_code,
      status: 'canceled',
    })
  }
}

async function handleSubscriptionNotRenew(event: PaystackWebhookEvent) {
  const { subscription_code, customer } = event.data

  if (!subscription_code || !customer?.customer_code) {
    console.warn('Missing subscription_code or customer_code')
    return
  }

  const supabase = await createClient()
  const { data } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', customer.customer_code)
    .single()

  if (data?.user_id) {
    await paymentService.upsertSubscription(data.user_id, {
      stripe_subscription_id: subscription_code,
      status: 'inactive',
    })
  }
}