'use client'

import { useEffect, useState } from 'react'

type Closer = { id: string; name: string }

export default function AdminPage() {
  const [name, setName] = useState('')
  const [closers, setClosers] = useState<Closer[]>([])
  const [error, setError] = useState('')

  const load = async () => {
    const r = await fetch('/api/closers')
    const d = (await r.json()) as Closer[]
    setClosers(d)
  }
  useEffect(() => { void load() }, [])

  const add = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const res = await fetch('/api/closers', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ name }) })
    if (res.ok) { setName(''); load() }
    else {
      const b = await res.json().catch(() => ({ error: 'Fehler' }))
      setError(b.error || 'Fehler')
    }
  }

  const removeCloser = async (id: string) => {
    setError('')
    const res = await fetch(`/api/closers?id=${id}`, { method: 'DELETE' })
    if (res.ok) load()
    else {
      const b = await res.json().catch(() => ({ error: 'Fehler' }))
      setError(b.error || 'Closer konnte nicht gelöscht werden')
    }
  }

  return (
    <div className="space-y-4 max-w-xl">
      <h1 className="text-2xl font-bold">Admin – Closer verwalten</h1>
      <form onSubmit={add} className="flex gap-2">
        <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Neuer Closer" className="flex-1 bg-neutral-800 border border-neutral-700 rounded px-3 py-2" />
        <button className="bg-blue-600 hover:bg-blue-500 rounded px-4">Hinzufügen</button>
      </form>
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
        <h2 className="font-medium mb-2">Aktive Closer</h2>
        <ul className="text-sm space-y-2">
          {closers.map((c)=>(
            <li key={c.id} className="flex items-center justify-between border border-neutral-800 rounded px-3 py-2">
              <span>{c.name}</span>
              <button type="button" onClick={() => removeCloser(c.id)} className="text-red-400 hover:text-red-300">Entfernen</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
