'use client'

import { useEffect, useState } from 'react'

type Traffic = { id: string; entry_date: string; ad_spend: number; leads: number; scheduled: number; lost_at_scheduling: number }
type Sale = { id: string; entry_date: string; closers?: { name: string }[]; attendance?: string; result: string; amount?: number; payment_type?: string }

export default function EntriesPage() {
  const [traffic, setTraffic] = useState<Traffic[]>([])
  const [sales, setSales] = useState<Sale[]>([])

  const load = async () => {
    const [t, s] = await Promise.all([
      fetch('/api/traffic?month=all').then((r) => r.json()),
      fetch('/api/sales?month=all').then((r) => r.json()),
    ])
    setTraffic(t)
    setSales(s)
  }

  useEffect(() => { void load() }, [])

  const delTraffic = async (id: string) => {
    await fetch(`/api/traffic?id=${id}`, { method: 'DELETE' })
    load()
  }
  const delSales = async (id: string) => {
    await fetch(`/api/sales?id=${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Einträge verwalten</h1>

      <section className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
        <h2 className="font-semibold mb-3">Traffic-Einträge</h2>
        <div className="space-y-2 text-sm">
          {traffic.map((r) => (
            <div key={r.id} className="border border-neutral-800 rounded p-2 flex items-center gap-2">
              <div className="flex-1">{r.entry_date} | Spend: {r.ad_spend} | Leads: {r.leads} | Terminiert: {r.scheduled} | Verloren: {r.lost_at_scheduling}</div>
              <button onClick={() => delTraffic(r.id)} className="text-red-400">Löschen</button>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
        <h2 className="font-semibold mb-3">Closer-Einträge</h2>
        <div className="space-y-2 text-sm">
          {sales.map((r) => (
            <div key={r.id} className="border border-neutral-800 rounded p-2 flex items-center gap-2">
              <div className="flex-1">{r.entry_date} | {r.closers?.[0]?.name || '-'} | Ergebnis: {r.result} | Betrag: {r.amount || 0} | {r.payment_type || '-'}</div>
              <button onClick={() => delSales(r.id)} className="text-red-400">Löschen</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
