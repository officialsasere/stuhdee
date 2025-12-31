'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCourseErrorMessage } from '@/lib/errors/course-errors'

export function CourseForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    course_name: '',
    exam_date: '',
    total_topics: 1,
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create course')
      }

      router.push('/dashboard')
      router.refresh()
    } catch (error) {
      console.error('Create Course error:', error)
      setError(getCourseErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
      <div>
        <label htmlFor="course_name" className="block text-sm font-medium mb-2 text-gray-600">
          Course Name
        </label>
        <input
          id="course_name"
          type="text"
          required
          value={formData.course_name}
          onChange={(e) => setFormData({ ...formData, course_name: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-500"
          placeholder="e.g., Data Structures"
        />
      </div>

      <div>
        <label htmlFor="exam_date" className="block text-sm font-medium mb-2 text-gray-600">
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
      </div>

      <div>
        <label htmlFor="total_topics" className="block text-sm font-medium mb-2 text-gray-600">
          Number of Topics
        </label>
        <input
          id="total_topics"
          type="number"
          required
          min="1"
          max="100"
          value={formData.total_topics}
          onChange={(e) => setFormData({ ...formData, total_topics: parseInt(e.target.value) })}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-400"
        />
        <p className="text-sm text-gray-500 mt-1">
          We&apos;ll create a study schedule to cover all topics before your exam
        </p>
      </div>

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
        {loading ? 'Creating...' : 'Create Course'}
      </button>
    </form>
  )
}