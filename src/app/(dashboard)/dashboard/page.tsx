import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

import type { Tables } from '@/types/database'

type StudySessionWithCourse = Tables<'study_sessions'> & {
  courses: Pick<Tables<'courses'>, 'course_name'> | null
}


export default async function DashboardPage() {
  const supabase = await createClient()
  
  // Check if user is logged in
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Get user profile with trial info
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get today's sessions
  const today = new Date().toISOString().split('T')[0]
  const { data: sessions } = await supabase
    .from('study_sessions')
    .select('*, courses(course_name)')
    .eq('session_date', today)
    .eq('completed', false)

  // Get total courses
  const { count: courseCount } = await supabase
    .from('courses')
    .select('*', { count: 'exact', head: true })

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-700">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {profile?.full_name}!</p>
        </div>

        {/* Trial Status Banner */}
        {profile?.trial_ends_at && new Date(profile.trial_ends_at) > new Date() && !profile.trial_used && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800">
              🎉 Trial active until {new Date(profile.trial_ends_at).toLocaleDateString()}
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Total Courses</p>
            <p className="text-3xl font-bold text-gray-400">{courseCount || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Today&apos;s Sessions</p>
            <p className="text-3xl font-bold text-gray-400">{sessions?.length || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Streak</p>
            <p className="text-3xl font-bold text-gray-400">0 🔥</p>
          </div>
        </div>

        {/* Today's Sessions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-700">Today&apos;s Study Sessions</h2>
          {sessions && sessions.length > 0 ? (
            <div className="space-y-3">
              {sessions.map((session: StudySessionWithCourse) => (
                <div key={session.id} className="border rounded-lg p-4">
                  <h3 className="font-semibold">{session.courses?.course_name}</h3>
                  <p className="text-gray-600 text-sm">{session.topic}</p>
                  <button className="mt-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm">
                    Mark Complete
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No sessions scheduled for today</p>
          )}
        </div>

        {/* Add Course Button */}
        <div className="text-center">
          
           <Link href="/courses/new"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
            + Add Course
          </Link>
        </div>

      </div>
    </div>
  )
}