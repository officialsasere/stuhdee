import { createClient } from '@/lib/supabase/client'

export const authService = {
  /**
   * Sign up new user
   */
  async signUp(email: string, password: string, fullName: string) {
    const supabase = createClient()
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (error) throw error
    return data
  },

  /**
   * Sign in existing user
   */
  async signIn(email: string, password: string) {
    const supabase = createClient()
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    return data
  },

  /**
   * Sign out current user
   */
  async signOut() {
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  /**
   * Get current session
   */
  async getSession() {
    const supabase = createClient()
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return session
  },

  /**
   * Get current user
   */
  // src/features/auth/services/auth.service.ts

async getUser() {
  const supabase = createClient()
  
  // 1. First, check if a session exists in local storage/cookies
  const { data: { session } } = await supabase.auth.getSession()
  
  // 2. If no session, return null immediately instead of calling getUser()
  if (!session) return null

  // 3. If session exists, securely verify it with the server
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error) {
    // Handle cases where the session might be expired or invalid
    console.error("Auth session error:", error.message)
    return null 
  }
  
  return user
},
}