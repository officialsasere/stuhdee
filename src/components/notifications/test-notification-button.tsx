'use client'

import { useState } from 'react'

export function TestNotificationButton() {
  const [loading, setLoading] = useState(false)

  async function handleTest() {
    setLoading(true)

    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Test Notification',
          body: 'This is a test notification from Study Reminder!',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send test notification')
      }

      alert('Test notification sent! Check your browser.')
    } catch (error: unknown) {
      console.error(error)
      alert('Failed to send notification. Make sure you enabled notifications first.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleTest}
      disabled={loading}
      className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 disabled:opacity-50"
    >
      {loading ? 'Sending...' : 'Test Notification'}
    </button>
  )
}