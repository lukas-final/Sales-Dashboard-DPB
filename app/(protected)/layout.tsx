import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSessionUser } from '@/lib/auth'

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const user = getSessionUser()
  if (!user) redirect('/login')

  return (
    <main className="apple-shell">
      <nav className="apple-nav px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center gap-2 md:gap-4 text-sm overflow-x-auto whitespace-nowrap">
          <span className="font-semibold mr-2">Sales Dashboard</span>
          <Link href="/data-entry" className="apple-btn-secondary py-1.5 px-3">Dateneingabe</Link>
          <Link href="/entries" className="apple-btn-secondary py-1.5 px-3">Einträge</Link>
          {user.role === 'ADMIN' ? (
            <>
              <Link href="/dashboard" className="apple-btn-secondary py-1.5 px-3">Dashboard</Link>
              <Link href="/admin" className="apple-btn-secondary py-1.5 px-3">Admin</Link>
            </>
          ) : null}
          <span className="ml-auto text-xs text-slate-300">{user.username} ({user.role})</span>
          <form action="/api/logout" method="post">
            <button className="apple-btn-primary py-1.5 px-3">Logout</button>
          </form>
        </div>
      </nav>
      <div className="max-w-6xl mx-auto p-4 md:p-6">{children}</div>
    </main>
  )
}
