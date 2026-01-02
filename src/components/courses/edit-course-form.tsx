'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Tables } from '@/types/database'

type Props = {
  course: Tables<'courses'>
}

export function EditCourseForm({ course }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  const [formData, setFormData] = useState({
    course_name: course.course_name,
    exam_date: course.exam_date,
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setLoading(true)

    try {
      const response = await fetch(`/api/courses/${course.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update course')
      }

      setSuccess(true)
      router.refresh()
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update course'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="course_name" className="block text-sm font-medium mb-2 text-gray-500">
          Course Name
        </label>
        <input
          id="course_name"
          type="text"
          required
          value={formData.course_name}
          onChange={(e) => setFormData({ ...formData, course_name: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-500"
        />
      </div>

      <div>
        <label htmlFor="exam_date" className="block text-sm font-medium mb-2 text-gray-500">
          Exam Date
        </label>
        <input
          id="exam_date"
          type="date"
          required
          min={new Date().toISOString().split('T')[0]}
          value={formData.exam_date}
          onChange={(e) => setFormData({ ...formData, exam_date: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          Note: Changing the exam date won&apos;t regenerate the schedule
        </p>
      </div>

      {success && (
        <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm">
          ✓ Course updated successfully
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

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