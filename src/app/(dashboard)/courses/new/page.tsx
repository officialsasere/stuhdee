import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CourseForm } from '@/components/courses/course-form'
import Link from 'next/link'
import { checkUserAccess } from '@/lib/access-control'

export default async function NewCoursePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check access
  const accessStatus = await checkUserAccess(user.id)

  if (!accessStatus.hasAccess) {
    redirect('/pricing')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link href="/dashboard" className="text-blue-600 hover:underline text-sm">
            ← Back to Dashboard
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-2xl font-bold mb-2 text-gray-700">Add New Course</h1>
          <p className="text-gray-600 mb-6">
            Tell us about your exam and we&apos;ll create a personalized study schedule
          </p>
          
          <CourseForm />
        </div>
      </div>
    </div>
  )
}