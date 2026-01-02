import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { checkUserAccess } from '@/lib/access-control'
import { EditCourseForm } from '@/components/courses/edit-course-form'
import Link from 'next/link'

export default async function EditCoursePage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  const accessStatus = await checkUserAccess(user.id)
  if (!accessStatus.hasAccess) {
    redirect('/pricing')
  }

  const { data: course } = await supabase
    .from('courses')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!course) {
    redirect('/courses')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link href={`/courses/${id}`} className="text-blue-600 hover:underline text-sm">
            ← Back to Course
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-2xl font-bold mb-6 text-gray-700">Edit Course</h1>
          <EditCourseForm course={course} />
        </div>
      </div>
    </div>
  )
}