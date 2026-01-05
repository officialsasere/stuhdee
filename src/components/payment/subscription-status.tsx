import type { Tables } from '@/types/database'
import { CancelSubscriptionButton } from './cancel-subscription-button'

type Props = {
  subscription: Tables<'subscriptions'> | null
}

export function SubscriptionStatus({ subscription }: Props) {
  if (!subscription || subscription.status !== 'active') {
    return null
  }

  const periodEnd = subscription.current_period_end 
    ? new Date(subscription.current_period_end)
    : null

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold mb-2">Active Subscription</h3>
          <p className="text-gray-600 text-sm mb-1">
            Plan: <span className="font-medium capitalize">{subscription.plan_type}</span>
          </p>
          {periodEnd && (
            <p className="text-gray-600 text-sm">
              Next billing: <span className="font-medium">{periodEnd.toLocaleDateString()}</span>
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
            Active
          </span>
          {subscription.stripe_subscription_id && (
            <CancelSubscriptionButton 
              subscriptionId={subscription.stripe_subscription_id} 
            />
          )}
        </div>
      </div>
    </div>
  )
}