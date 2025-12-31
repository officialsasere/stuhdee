type GeneratedSession = {
  session_date: string
  topic: string
  duration_minutes: number
}

export const scheduleService = {
  /**
   * Generate study schedule from today to exam date
   */
  generateSchedule(examDate: string, totalTopics: number): GeneratedSession[] {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const exam = new Date(examDate)
    exam.setHours(0, 0, 0, 0)
    
    // Calculate days until exam
    const daysUntilExam = Math.ceil((exam.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysUntilExam <= 0) {
      throw new Error('Exam date must be in the future')
    }
    
    // Calculate topics per day (round up to ensure all topics covered)
    const topicsPerDay = Math.ceil(totalTopics / daysUntilExam)
    
    const sessions: GeneratedSession[] = []
    let topicNumber = 1
    
    // Generate sessions for each day
    for (let day = 0; day < daysUntilExam && topicNumber <= totalTopics; day++) {
      const sessionDate = new Date(today)
      sessionDate.setDate(today.getDate() + day)
      
      // Create sessions for this day
      const topicsForToday = Math.min(topicsPerDay, totalTopics - topicNumber + 1)
      
      for (let i = 0; i < topicsForToday && topicNumber <= totalTopics; i++) {
        sessions.push({
          session_date: sessionDate.toISOString().split('T')[0],
          topic: `Topic ${topicNumber}`,
          duration_minutes: 30,
        })
        topicNumber++
      }
    }
    
    return sessions
  }
}