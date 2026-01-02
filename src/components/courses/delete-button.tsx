'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  courseId: string
  courseName: string
}

export function DeleteButton({ courseId, courseName }: Props) {
  const router = useRouter()
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    setLoading(true)

    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete course')
      }

      router.push('/courses')
      router.refresh()
    } catch (error: unknown) {
      console.error(error)
      alert('Failed to delete course')
      setLoading(false)
    }
  }

  if (!showConfirm) {
    return (
      <button
        onClick={() => setShowConfirm(true)}
        className="text-red-600 hover:text-red-700 text-sm font-medium"
      >
        Delete Course
      </button>
    )
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <p className="text-sm text-red-900 mb-3">
        Delete &quot;{courseName}&quot;? This will remove all study sessions. This cannot be undone.
      </p>
      <div className="flex gap-2">
        <button
          onClick={handleDelete}
          disabled={loading}
          className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? 'Deleting...' : 'Yes, Delete'}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-300"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}