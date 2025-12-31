import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function PricingPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600">
            Choose the plan that works for you
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Monthly Plan */}
          <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-gray-200">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Monthly</h3>
              <div className="flex items-baseline justify-center">
                <span className="text-5xl font-bold text-gray-700">$2</span>
                <span className="text-gray-600 ml-2">/month</span>
              </div>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span className='text-gray-500'>Unlimited courses</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span className='text-gray-500'>Personalized study schedules</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span className='text-gray-500'>Daily reminders</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span className='text-gray-500'>Progress tracking</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span className='text-gray-500'>Cancel anytime</span>
              </li>
            </ul>

            <button
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 font-semibold"
              disabled
            >
              Coming Soon
            </button>
            <p className="text-xs text-center text-gray-500 mt-2">
              Payment integration in progress
            </p>
          </div>

          {/* Semester Plan */}
          <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-blue-600 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                Best Value
              </span>
            </div>

            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Semester</h3>
              <div className="flex items-baseline justify-center">
                <span className="text-5xl font-bold text-gray-700">$5</span>
                <span className="text-gray-600 ml-2">/4 months</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">Save 38% vs monthly</p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span className='text-gray-500'>Everything in Monthly</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span className="font-semibold text-gray-500">4 months of access</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span className="font-semibold text-gray-500">Perfect for one semester</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">✓</span>
                <span className="text-gray-500">Priority support</span>
              </li>
            </ul>

            <button
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 font-semibold"
              disabled
            >
              Coming Soon
            </button>
            <p className="text-xs text-center text-gray-500 mt-2">
              Payment integration in progress
            </p>
          </div>
        </div>

        <div className="text-center mt-12">
          <Link
            href="/dashboard"
            className="text-blue-600 hover:underline"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}