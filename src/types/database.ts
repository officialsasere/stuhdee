export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      courses: {
        Row: {
          id: string
          user_id: string
          course_name: string
          exam_date: string
          total_topics: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          course_name: string
          exam_date: string
          total_topics?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          course_name?: string
          exam_date?: string
          total_topics?: number
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          avatar_url: string | null
          trial_starts_at: string
          trial_ends_at: string
          trial_used: boolean
          notification_enabled: boolean
          notification_time: string
          timezone: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          trial_starts_at?: string
          trial_ends_at?: string
          trial_used?: boolean
          notification_enabled?: boolean
          notification_time?: string
          timezone?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          trial_starts_at?: string
          trial_ends_at?: string
          trial_used?: boolean
          notification_enabled?: boolean
          notification_time?: string
          timezone?: string
          created_at?: string
          updated_at?: string
        }
      }
      study_sessions: {
        Row: {
          id: string
          course_id: string
          user_id: string
          session_date: string
          topic: string | null
          duration_minutes: number
          completed: boolean
          completed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          course_id: string
          user_id: string
          session_date: string
          topic?: string | null
          duration_minutes?: number
          completed?: boolean
          completed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          user_id?: string
          session_date?: string
          topic?: string | null
          duration_minutes?: number
          completed?: boolean
          completed_at?: string | null
          created_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          status: string
          plan_type: string
          current_period_start: string | null
          current_period_end: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          status?: string
          plan_type?: string
          current_period_start?: string | null
          current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          status?: string
          plan_type?: string
          current_period_start?: string | null
          current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Functions: {
      user_has_access: {
        Args: { user_id_input: string }
        Returns: boolean
      }
      get_user_account_status: {
        Args: { user_id_input: string }
        Returns: string
      }
    }
  }
}