import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SettingsForm } from '@/components/settings/settings-form'
import Link from 'next/link'
import { TestNotificationButton } from '@/components/notifications/test-notification-button'

export default async function SettingsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/login')
  }

  // Get subscription
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // Get last successful transaction
  const { data: lastTransaction } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'success')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const today = new Date()
  const trialEndsAt = profile.trial_ends_at ? new Date(profile.trial_ends_at) : new Date()
  const daysRemaining = Math.ceil((trialEndsAt.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  const inTrial = daysRemaining > 0 && !profile.trial_used
  const hasActiveSubscription = subscription?.status === 'active'

  // Calculate next payment
  const nextPaymentDate = subscription?.current_period_end 
    ? new Date(subscription.current_period_end)
    : null
  
  const nextPaymentAmount = lastTransaction?.amount 
    ? (lastTransaction.amount / 100).toLocaleString()
    : null

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-700">Settings</h1>
          <p className="text-gray-600">Manage your account and preferences</p>
        </div>

        {/* Active Subscription */}
        {hasActiveSubscription ? (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-700">Active Subscription</h3>
                <p className="text-gray-600 text-sm mb-1">
                  Plan: <span className="font-medium capitalize">{subscription.plan_type}</span>
                </p>
              </div>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                Active
              </span>
            </div>

            {/* Next Payment Info */}
            {nextPaymentDate && (
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Next Payment Date:</span>
                  <span className="font-semibold text-gray-900">
                    {nextPaymentDate.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                {nextPaymentAmount && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-semibold text-gray-900">₦{nextPaymentAmount}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Days Until Renewal:</span>
                  <span className="font-semibold text-gray-900">
                    {Math.max(0, Math.ceil((nextPaymentDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)))} days
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Trial/Expired Status */
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-500">Account Status</h3>
            
            {inTrial ? (
              <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div>
                  <p className="font-semibold text-blue-900">Free Trial Active</p>
                  <p className="text-sm text-blue-700">
                    {daysRemaining} days remaining
                  </p>
                </div>
                <Link
                  href="/pricing"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
                >
                  Upgrade Now
                </Link>
              </div>
            ) : (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="font-semibold text-red-900">Trial Expired</p>
                <p className="text-sm text-red-700 mb-3">
                  Subscribe to continue using Stuhdee
                </p>
                <Link
                  href="/pricing"
                  className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
                >
                  View Plans
                </Link>
              </div>
            )}
          </div>
        )}

        {/* <div className="mt-4">
          <TestNotificationButton />
        </div> */}

        {/* Transactions Link */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-700">Billing</h3>
          <Link
            href="/transactions"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            View transaction history →
          </Link>
        </div>

        {/* Settings Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <SettingsForm profile={profile} />
        </div>
      </div>
    </div>
  )
}