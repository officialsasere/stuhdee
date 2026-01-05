'use client'

import { useState } from 'react'

type Props = {
  planType: 'MONTHLY' | 'SEMESTER'
  planName: string
}

export function PaystackCheckoutButton({ planType, planName }: Props) {
  const [loading, setLoading] = useState(false)

  async function handleCheckout() {
    setLoading(true)

    try {
      const response = await fetch('/api/subscription/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planType }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to initialize payment')
      }
      console.log('response', response)

      const { authorization_url } = await response.json()
      window.location.href = authorization_url
    } catch (error: unknown) {
      console.error('Checkout error:', error)
      const message = error instanceof Error ? error.message : 'Failed to start checkout'
      alert(message)
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50 transition"
    >
      {loading ? 'Loading...' : `Subscribe - ${planName}`}
    </button>
  )
}