'use client'

import { useEffect, useState } from 'react'

type Closer = { id: string; name: string }

export default function AdminPage() {
  const [name, setName] = useState('')
  const [closers, setClosers] = useState<Closer[]>([])

  const load = async () => {
    const r = await fetch('/api/closers')
    const d = (await r.json()) as Closer[]
    setClosers(d)
  }
  useEffect(() => { void load() }, [])

  const add = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/closers', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ name }) })
    if (res.ok) { setName(''); load() }
    else alert('Fehler')
  }

  return (
    <div className="space-y-4 max-w-xl">
      <h1 className="text-2xl font-bold">Admin – Closer verwalten</h1>
      <form onSubmit={add} className="flex gap-2">
        <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Neuer Closer" className="flex-1 bg-neutral-800 border border-neutral-700 rounded px-3 py-2" />
        <button className="bg-blue-600 hover:bg-blue-500 rounded px-4">Hinzufügen</button>
      </form>
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
        <h2 className="font-medium mb-2">Aktive Closer</h2>
        <ul className="list-disc list-inside text-sm space-y-1">
          {closers.map((c)=><li key={c.id}>{c.name}</li>)}
        </ul>
      </div>
    </div>
  )
}
