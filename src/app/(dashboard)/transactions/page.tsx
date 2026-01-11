import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Tables } from '@/types/database'
import { createClient } from '@/lib/supabase/server'

type Transaction = Tables<'transactions'>

export default async function TransactionsPage() {
  // ✅ Auth-aware client (uses cookies)
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // ✅ RLS-safe query (user can only see their rows)
  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Transaction fetch error:', error)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-700">
              Transaction History
            </h1>
            <p className="text-gray-600">
              View all your payment transactions
            </p>
          </div>
          <Link
            href="/settings"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            ← Back to Settings
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {transactions && transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Reference
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Plan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {transactions.map((transaction: Transaction) => (
                    <tr key={transaction.id}>
                      <td className="px-6 py-4 text-sm">
                        {transaction.created_at
                          ? new Date(transaction.created_at).toLocaleDateString()
                          : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm font-mono">
                        {transaction.reference.slice(0, 16)}…
                      </td>
                      <td className="px-6 py-4 text-sm capitalize">
                        {transaction.plan_type || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        ₦{(transaction.amount / 100).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            transaction.status === 'success'
                              ? 'bg-green-100 text-green-800'
                              : transaction.status === 'failed'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No transactions yet</p>
              <Link
                href="/pricing"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
              >
                Subscribe Now
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
