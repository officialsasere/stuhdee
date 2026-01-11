

import { createClient } from '@/lib/supabase/server'
import { paystackClient } from '@/lib/paystack/client'

import { redirect } from 'next/navigation'
import { paymentService } from '@/features/payments/services/payment.service'

export async function GET(request: Request) {

    const { searchParams } = new URL(request.url)
    const reference = searchParams.get('reference')

    console.log('=== CALLBACK START ===')
  console.log('Reference:', reference)


    if (!reference) {
      console.log('No reference, redirecting to failed')
      redirect('/dashboard?payment=failed')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      console.log('No user, redirecting to login')
      redirect('/login')
    }
    console.log('User ID:', user.id)
  try {
    // Verify transaction with Paystack
    const verification = await paystackClient.verifyTransaction(reference!)
     const verificationData = verification.data as { 
      status: string
      customer: { customer_code: string }
      metadata?: { plan_type?: string; user_id?: string }
      plan?: string
      plan_object?: { interval: string }
      amount: number
      reference: string
}
    
    console.log('Verification status:', verificationData.status)
    console.log('Plan:', verificationData.plan)
    console.log('Customer:', verificationData.customer?.customer_code)
    

    if (verificationData.status === 'success') {
      const { customer, metadata, plan, plan_object, amount } = verificationData

      // Update transaction record
      await supabase
        .from('transactions')
        .update({
          status: 'success',
          payment_method: 'paystack',
          paystack_data: JSON.parse(JSON.stringify(verificationData)),
        })
        .eq('reference', reference!)

      // Create subscription if payment was for a subscription
      if (plan && customer) {
        const now = new Date()
        const periodEnd = new Date(now)
        
        // Calculate period end based on plan interval
        if (plan_object?.interval === 'monthly') {
          periodEnd.setMonth(periodEnd.getMonth() + 1)
        } else if (plan_object?.interval === 'quarterly') {
          periodEnd.setMonth(periodEnd.getMonth() + 3)
        } else {
          periodEnd.setDate(periodEnd.getDate() + 30)
        }

        // Create/update subscription
        await paymentService.upsertSubscription(user.id, {
          stripe_customer_id: customer.customer_code,
          stripe_subscription_id: plan,
          status: 'active',
          plan_type: metadata?.plan_type,
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
        })

        // Mark trial as used
        await paymentService.markTrialAsUsed(user.id)
      }

      
    } else {
      // Update transaction as failed
      await supabase
        .from('transactions')
        .update({
          status: 'failed',
          paystack_data: JSON.parse(JSON.stringify(verificationData)),
        })
        .eq('reference', reference!)

      redirect('/dashboard?payment=failed')
    }
  } catch (error: unknown) {
    console.error('Callback error:', error)
    redirect('/dashboard?payment=error')
  }
  redirect('/dashboard?payment=success')
}