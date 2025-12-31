export type Course = {
  id: string
  user_id: string
  course_name: string
  exam_date: string
  total_topics: number
  created_at: string
  updated_at: string
}

export type CreateCourseInput = {
  course_name: string
  exam_date: string
  total_topics: number
}

export type StudySession = {
  id: string
  course_id: string
  session_date: string
  topic: string
  completed: boolean
}