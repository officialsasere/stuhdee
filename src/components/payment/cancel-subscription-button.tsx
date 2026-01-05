'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  subscriptionId: string
}

export function CancelSubscriptionButton({ subscriptionId }: Props) {
  const router = useRouter()
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleCancel() {
    setLoading(true)

    try {
      const response = await fetch('/api/subscription/paystack/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionCode: subscriptionId }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to cancel subscription')
      }

      alert('Subscription canceled successfully. You\'ll have access until the end of your billing period.')
      setShowConfirm(false)
      router.refresh()
    } catch (error: unknown) {
      console.error('Cancel error:', error)
      const message = error instanceof Error ? error.message : 'Failed to cancel subscription'
      alert(message)
    } finally {
      setLoading(false)
    }
  }

  if (!showConfirm) {
    return (
      <button
        onClick={() => setShowConfirm(true)}
        className="text-red-600 hover:text-red-700 text-sm"
      >
        Cancel Subscription
      </button>
    )
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-sm">
      <p className="text-sm text-red-900 mb-3">
        Cancel your subscription? You&apos;ll have access until the end of your billing period.
      </p>
      <div className="flex gap-2">
        <button
          onClick={handleCancel}
          disabled={loading}
          className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? 'Canceling...' : 'Yes, Cancel'}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-300"
        >
          Keep Subscription
        </button>
      </div>
    </div>
  )
}