import { createClient } from '@/lib/supabase/server'
import { courseService } from '@/features/courses/services/course.service'
import { NextResponse } from 'next/server'
import { getApiErrorResponse } from '@/lib/errors/api-errors'
import { checkUserAccess } from '@/lib/access-control'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Get user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

   // Check access
    const accessStatus = await checkUserAccess(user.id)
    if (!accessStatus.hasAccess) {
      return NextResponse.json(
        { 
          error: 'Subscription required',
          message: 'Your trial has ended. Please subscribe to continue.' 
        },
        { status: 403 }
      )
    }

    // Parse input
    const body = await request.json()
    const { course_name, exam_date, total_topics } = body

    // Validate
    if (!course_name || !exam_date || !total_topics) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create course
    const course = await courseService.createCourse(user.id, {
      course_name,
      exam_date,
      total_topics: parseInt(total_topics),
    })

    return NextResponse.json(course)
  } catch (error) {
    console.error('Create course error:', error)

    return NextResponse.json(
      { error: getApiErrorResponse(error) || 'Failed to create course' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const courses = await courseService.getUserCourses(user.id)
    return NextResponse.json(courses)
  } catch (error) {
    console.error('Fetch courses error:', error)
    return NextResponse.json(
      { error: getApiErrorResponse(error) || 'Failed to fetch courses' },
      { status: 500 }
    )
  }
}