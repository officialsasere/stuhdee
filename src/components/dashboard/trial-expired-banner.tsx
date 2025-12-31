import Link from 'next/link'

export function TrialExpiredBanner() {
  return (
    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 mb-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-bold text-red-900 mb-2">
            Your Trial Has Ended
          </h3>
          <p className="text-red-700 mb-4">
            Subscribe now to continue accessing your study schedule and stay on track with your exams.
          </p>
          <Link
            href="/pricing"
            className="inline-block bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 font-semibold"
          >
            View Plans - From $2/month
          </Link>
        </div>
      </div>
    </div>
  )
}