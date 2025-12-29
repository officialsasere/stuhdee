'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { getAuthErrorMessage } from '@/lib/auth-errors'
import { Eye, EyeOff } from 'lucide-react'

export function LoginForm() {
  const router = useRouter()
  const { signIn } = useAuth()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await signIn(email, password)
      router.push('/dashboard')
    } catch (error) {
      console.error('Supabase Login error:', error)
      setError(getAuthErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md">
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-2 text-gray-700">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
         className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 border-gray-400 text-gray-600" 
          placeholder="you@example.com"
        
          
        />
      </div>

      <div className='relative'>
        <label htmlFor="password" className="block text-sm font-medium mb-2 text-gray-700">
          Password
        </label>
        <input
          id="password"
          type={showPassword ? "text" :  "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
         className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 border-gray-400 text-gray-600" 
          placeholder="••••••••"
        />
          <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    className="absolute right-3 top-3/4 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
    tabIndex={-1} // avoid focusing on tab
  >
    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
  </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  )
}