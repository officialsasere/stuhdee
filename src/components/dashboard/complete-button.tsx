'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  sessionId: string
}

export function CompleteButton({ sessionId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleComplete() {
    setLoading(true)

    try {
      const response = await fetch(`/api/sessions/${sessionId}/complete`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to mark complete')
      }

      router.refresh()
    } catch (error) {
      console.error(error)
      alert('Failed to mark session as complete')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleComplete}
      disabled={loading}
      className="mt-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 disabled:opacity-50 cursor-pointer"
    >
      {loading ? 'Marking...' : 'Mark Complete'}
    </button>
  )
}