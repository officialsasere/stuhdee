import { createClient } from '@/lib/supabase/server'
import { courseService } from '@/features/courses/services/course.service'
import { NextResponse } from 'next/server'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { course_name, exam_date } = body

    const course = await courseService.updateCourse(id, user.id, {
      course_name,
      exam_date,
    })

    return NextResponse.json(course)
  } catch (error: unknown) {
    console.error('Update course error:', error)
    const message = error instanceof Error ? error.message : 'Failed to update course'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await courseService.deleteCourse(id, user.id)

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('Delete course error:', error)
    const message = error instanceof Error ? error.message : 'Failed to delete course'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}