import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SettingsForm } from '@/components/settings/settings-form'
import Link from 'next/link'

export default async function SettingsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/login')
  }

  // Calculate days remaining in trial
  const trialEndsAt = profile.trial_ends_at ? new Date(profile.trial_ends_at) : new Date()
  const today = new Date()
  const daysRemaining = Math.ceil((trialEndsAt.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  const inTrial = daysRemaining > 0 && !profile.trial_used

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-700">Settings</h1>
          <p className="text-gray-600">Manage your account and preferences</p>
        </div>

        {/* Account Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-500">Account Status</h3>
          
          {inTrial ? (
            <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div>
                <p className="font-semibold text-blue-900">Free Trial Active</p>
                <p className="text-sm text-blue-700">
                  {daysRemaining} days remaining
                </p>
              </div>
              
               <Link href="/pricing"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
              >
                Upgrade Now
              </Link>
            </div>
          ) : (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="font-semibold text-gray-900">Trial Expired</p>
              <p className="text-sm text-gray-600 mb-3">
                Subscribe to continue using Stuhdee
              </p>
              
              <Link  href="/pricing"
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
              >
                View Plans
              </Link>
            </div>
          )}
        </div>

        {/* Settings Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <SettingsForm profile={profile} />
        </div>
      </div>
    </div>
  )
}