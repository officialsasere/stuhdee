import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Tables } from '@/types/database'
import { CompleteButton } from '@/components/dashboard/complete-button'
import { DeleteButton } from '@/components/courses/delete-button'

type Session = Tables<'study_sessions'>
// type Course = Tables<'courses'>

export default async function CoursePage({ params }: { params: Promise<{ id: string }> }) {

    const { id } = await params
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Get course
  const { data: course } = await supabase
    .from('courses')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!course) {
    redirect('/courses')
  }

  // Get all sessions
  const { data: sessions } = await supabase
    .from('study_sessions')
    .select('*')
    .eq('course_id', id)
    .order('session_date', { ascending: true })

  const completedCount = sessions?.filter(s => s.completed).length || 0
  const totalCount = sessions?.length || 0
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <Link href="/courses" className="text-blue-600 hover:underline text-sm">
            ← Back to Courses
          </Link>
          
        </div>

        

        {/* Course Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start mb-4">
    <h1 className="text-3xl font-bold text-gray-700">{course.course_name}</h1>
    <div className="flex gap-3">
      <Link
        href={`/courses/${course.id}/edit`}
        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
      >
        Edit Course
      </Link>
      <DeleteButton courseId={course.id} courseName={course.course_name} />
    </div>
  </div>
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-gray-600 text-sm">Exam Date</p>
              <p className="text-lg font-semibold text-gray-400">
                {new Date(course.exam_date).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Total Topics</p>
              <p className="text-lg font-semibold text-gray-400">{course.total_topics}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Progress</p>
              <p className="text-lg font-semibold text-gray-400">{progressPercent}%</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 bg-gray-200 rounded-full h-3">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Study Sessions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-700">Study Sessions</h2>
          
          {sessions && sessions.length > 0 ? (
            <div className="space-y-2">
              {sessions.map((session: Session) => (
                <div
                  key={session.id}
                  className={`border rounded-lg p-4 ${
                    session.completed ? 'bg-green-50 border-green-200' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-400">{session.topic}</h3>
                      <p className="text-sm text-gray-600">
                        {new Date(session.session_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      {session.completed ? (
                        <span className="text-green-600 font-semibold">✓ Completed</span>
                      ) : (
                        <CompleteButton sessionId={session.id} />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No sessions found</p>
          )}
        </div>
      </div>
    </div>
  )
}