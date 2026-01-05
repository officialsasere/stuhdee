'use client'

import { useState, useEffect } from 'react'
import { requestNotificationPermission, onMessageListener } from '@/lib/firebase/messaging'

export function NotificationPrompt() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Check if permission already granted
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        setShowPrompt(true)
      } else if (Notification.permission === 'granted') {
        // Set up message listener
        onMessageListener()
      }
    }
  }, [])

  async function handleEnable() {
    setLoading(true)

    try {
      const token = await requestNotificationPermission()
      
      if (!token) {
        alert('Failed to enable notifications. Please check browser permissions.')
        return
      }

      // Save token to database
      const response = await fetch('/api/notifications/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })

      if (!response.ok) {
        throw new Error('Failed to save notification token')
      }

      setShowPrompt(false)
      
      // Set up message listener
      onMessageListener()
      
      alert('Notifications enabled! You\'ll receive daily study reminders.')
    } catch (error: unknown) {
      console.error('Enable notifications error:', error)
      alert('Failed to enable notifications. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!showPrompt) return null

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-blue-900 mb-1">
            📬 Enable Study Reminders
          </h3>
          <p className="text-sm text-blue-700 mb-3">
            Get daily notifications to stay on track with your study schedule
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleEnable}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Enabling...' : 'Enable Notifications'}
            </button>
            <button
              onClick={() => setShowPrompt(false)}
              className="text-blue-600 hover:text-blue-700 text-sm px-4 py-2"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}