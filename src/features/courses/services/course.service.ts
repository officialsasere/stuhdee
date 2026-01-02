import { createClient } from '@/lib/supabase/server'
import { CreateCourseInput } from '../types'
import { scheduleService } from './schedule.service'

export const courseService = {
  /**
   * Create course and generate study sessions
   */
  async createCourse(userId: string, input: CreateCourseInput) {
    const supabase = await createClient()


    const startDate = input.start_date || new Date().toISOString().split('T')[0]
// Validate business rule
     if (startDate > input.exam_date) {
    throw new Error('Start date cannot be after exam date')
  }
    // 1. Create course
    const { data: course, error: courseError } = await supabase
    
      .from('courses')
      .insert({
        user_id: userId,
        course_name: input.course_name,
        exam_date: input.exam_date,
        total_topics: input.total_topics,
        start_date: startDate,
      })
      .select()
      .single()
    
    if (courseError) throw courseError
    
    // 2. Generate study schedule
    const sessions = scheduleService.generateSchedule(
      
      input.exam_date,
      input.total_topics,
      input.start_date
     
    )
    
    // 3. Insert study sessions
    const sessionsToInsert = sessions.map(session => ({
      course_id: course.id,
      user_id: userId,
      ...session,
    }))
    
    const { error: sessionsError } = await supabase
      .from('study_sessions')
      .insert(sessionsToInsert)
    
    if (sessionsError) throw sessionsError
    
    return course
  },

  /**
   * Get all courses for user
   */
  async getUserCourses(userId: string) {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('user_id', userId)
      .order('exam_date', { ascending: true })
    
    if (error) throw error
    return data
  },

  /**
   * Get single course with sessions
   */
  async getCourse(courseId: string, userId: string) {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('courses')
      .select('*, study_sessions(*)')
      .eq('id', courseId)
      .eq('user_id', userId)
      .single()
    
    if (error) throw error
    return data
  },

  /**
 * Delete course and all its sessions
 */
async deleteCourse(courseId: string, userId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('courses')
    .delete()
    .eq('id', courseId)
    .eq('user_id', userId)
  
  if (error) throw error
},

/**
 * Update course
 */
async updateCourse(
  courseId: string, 
  userId: string, 
  input: { course_name?: string; exam_date?: string; start_date?: string; total_topics?: number }
) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('courses')
    .update(input)
    .eq('id', courseId)
    .eq('user_id', userId)
    .select()
    .single()
  
  if (error) throw error
  return data
}
}

