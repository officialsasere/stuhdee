import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Tables } from '@/types/database'

type Course = Tables<'courses'>

export default async function CoursesPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data: courses } = await supabase
    .from('courses')
    .select('*')
    .eq('user_id', user.id)
    .order('exam_date', { ascending: true })

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-700">My Courses</h1>
            <p className="text-gray-600">All your courses and exams</p>
          </div>
          <Link
            href="/courses/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + Add Course
          </Link>
        </div>

        {courses && courses.length > 0 ? (
          <div className="grid gap-4">
            {courses.map((course: Course) => (
              <Link
                key={course.id}
                href={`/courses/${course.id}`}
                className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-600">{course.course_name}</h3>
                    <p className="text-gray-600 text-sm mt-1">
                      {course.total_topics} topics
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Exam Date</p>
                    <p className="font-semibold text-gray-400">
                      {new Date(course.exam_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="mt-4 flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                  </div>
                  <span className="text-sm text-gray-600">0% complete</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 mb-4">No courses yet</p>
            <Link
              href="/courses/new"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Add Your First Course
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}