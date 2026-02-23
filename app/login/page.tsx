'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (!res.ok) return setError('Falsches Passwort')
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-4">
        <h1 className="text-xl font-semibold">Sales Dashboard Login</h1>
        <input
          type="password"
          className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2"
          placeholder="Passwort"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error ? <p className="text-red-400 text-sm">{error}</p> : null}
        <button className="w-full bg-blue-600 hover:bg-blue-500 rounded-lg py-2">Einloggen</button>
      </form>
    </main>
  )
}
