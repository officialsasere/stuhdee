'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Profile } from '@/features/user/types'


type Props = {
  profile: Profile
}

export function SettingsForm({ profile }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    full_name: profile.full_name || '',
    notification_enabled: profile.notification_enabled ?? false,
    notification_time: profile.notification_time || '09:00:00',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setLoading(true)

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update profile')
      }

      setSuccess(true)
      router.refresh()
      
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update settings'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Profile Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-500">Profile</h3>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-gray-500 mb-2">
              Full Name
            </label>
            <input
              id="full_name"
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-500">
              Email
            </label>
            <input
              type="email"
              value={profile.email || ''}
              disabled
              className="w-full px-4 py-2 border rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>
        </div>
      </div>

      {/* Notifications Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-500">Notifications</h3>
        
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              id="notification_enabled"
              type="checkbox"
              checked={formData.notification_enabled ?? false}
              onChange={(e) => setFormData({ ...formData, notification_enabled: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="notification_enabled" className="ml-2 text-sm  text-gray-500">
              Enable study reminders
            </label>
          </div>

          {formData.notification_enabled && (
            <div>
              <label htmlFor="notification_time" className="block text-sm font-medium mb-2 text-gray-500">
                Reminder Time
              </label>
              <input
                id="notification_time"
                type="time"
                value={formData.notification_time.substring(0, 5)}
                onChange={(e) => setFormData({ ...formData, notification_time: e.target.value + ':00' })}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                We&apos;ll send you a daily reminder at this time
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      {success && (
        <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm">
          ✓ Settings saved successfully
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  )
}