'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    if (!res.ok) {
      const b = await res.json().catch(() => ({ error: 'Login fehlgeschlagen' }))
      return setError(b.error || 'Login fehlgeschlagen')
    }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={onSubmit} className="apple-card w-full max-w-sm p-6 space-y-4">
        <div>
          <h1 className="text-2xl font-semibold">Willkommen</h1>
          <p className="text-sm text-slate-500">Sales Dashboard Login</p>
        </div>
        <input
          type="text"
          className="apple-input"
          placeholder="Benutzername"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          className="apple-input"
          placeholder="Passwort"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error ? <p className="text-red-600 text-sm">{error}</p> : null}
        <button className="w-full apple-btn-primary">Einloggen</button>
        <p className="text-xs text-slate-500">Admin: admin / DPB2026 · Closer: alex|niklas / Closing</p>
      </form>
    </main>
  )
}
