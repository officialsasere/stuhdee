import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'


export const useUser = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchUser = async () => {
      // 1. Check local session first for speed
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        // 2. Securely verify the user with a network call
        const { data: { user: verifiedUser }, error } = await supabase.auth.getUser()
        if (!error && verifiedUser) {
          setUser(verifiedUser)
        }
      }
      setLoading(false)
    }

    fetchUser()

    // 3. Listen for auth changes (login/logout/refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  return { user, loading }
}
