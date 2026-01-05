import Link from 'next/link'

export function Nav() {
  return (
    <nav className="bg-white border-b shadow-sm ">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-xl font-bold text-gray-700">
            Stuhdee
          </Link>
          <Link 
            href="/dashboard" 
            className="text-gray-600 hover:text-gray-900"
          >
            Dashboard
          </Link>
          <Link 
            href="/courses" 
            className="text-gray-600 hover:text-gray-900"
          >
            Courses
          </Link>
          <Link 
            href="/settings" 
            className="text-gray-600 hover:text-gray-900"
          >
            Settings
          </Link>
          <Link 
  href="/transactions" 
  className="text-gray-600 hover:text-gray-900"
>
  Transactions
</Link>
        </div>
        
        <form action="/api/auth/signout" method="post">
          <button className="text-sm text-gray-600 hover:text-gray-900">
            Sign Out
          </button>
        </form>
      </div>
    </nav>
  )
}