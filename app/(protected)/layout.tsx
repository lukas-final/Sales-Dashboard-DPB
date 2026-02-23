import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const pass = String(process.env.APP_ADMIN_PASSWORD || '').trim()
  const auth = String(cookies().get('sdpb_auth')?.value || '').trim()
  if (!pass || auth !== pass) redirect('/login')

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <nav className="border-b border-neutral-800 px-4 py-3 flex gap-4 text-sm">
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/data-entry">Dateneingabe</Link>
        <Link href="/admin">Admin</Link>
        <form action="/api/logout" method="post" className="ml-auto"><button>Logout</button></form>
      </nav>
      <div className="p-4">{children}</div>
    </main>
  )
}
