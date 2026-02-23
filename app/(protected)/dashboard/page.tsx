'use client'

import { useEffect, useState } from 'react'

type Stats = {
  totals: {
    adSpend: number
    leads: number
    appointments: number
    noShows: number
    noShowQuote: number
    lostAtScheduling: number
    totalRevenue: number
    closes: number
    avgDeal: number
    roi: number
  }
  closerStats: Array<{ name: string; closeRate: number; followUpRate: number; lostRate: number; revenue: number; full: number; installment: number }>
}

export default function DashboardPage() {
  const [month, setMonth] = useState('all')
  const [data, setData] = useState<Stats | null>(null)

  useEffect(() => {
    fetch(`/api/stats?month=${month}`).then((r) => r.json()).then(setData)
  }, [month])

  const t = data?.totals
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold">Sales Dashboard</h1>
        <select className="ml-auto bg-neutral-800 border border-neutral-700 rounded px-2 py-1" value={month} onChange={(e) => setMonth(e.target.value)}>
          <option value="all">Gesamt</option>
          {['2026-01','2026-02','2026-03','2026-04','2026-05','2026-06','2026-07','2026-08','2026-09','2026-10','2026-11','2026-12'].map((m)=><option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <Card title="Ad Spend" value={euro(t?.adSpend)} />
        <Card title="Leads" value={String(t?.leads ?? 0)} />
        <Card title="Termine" value={String(t?.appointments ?? 0)} />
        <Card title="No Shows" value={`${t?.noShows ?? 0} (${pct(t?.noShowQuote)})`} />
        <Card title="Verloren Terminierung" value={String(t?.lostAtScheduling ?? 0)} />
        <Card title="Umsatz" value={euro(t?.totalRevenue)} />
        <Card title="Abschlüsse" value={String(t?.closes ?? 0)} />
        <Card title="Ø Abschluss" value={euro(t?.avgDeal)} />
        <Card title="ROI" value={pct(t?.roi)} />
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
        <h2 className="font-semibold mb-3">Closer Statistiken</h2>
        <div className="space-y-2">
          {data?.closerStats?.map((c) => (
            <div key={c.name} className="text-sm border border-neutral-800 rounded p-3">
              <div className="font-medium">{c.name}</div>
              <div>Abschlussquote: {pct(c.closeRate)} | Follow Up: {pct(c.followUpRate)} | Verloren: {pct(c.lostRate)}</div>
              <div>Umsatz: {euro(c.revenue)} | Vollzahler: {euro(c.full)} | Ratenzahler: {euro(c.installment)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Card({ title, value }: { title: string; value: string }) {
  return <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3"><div className="text-neutral-400">{title}</div><div className="text-lg font-semibold">{value}</div></div>
}

function euro(v?: number) { return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(v ?? 0) }
function pct(v?: number) { return `${(v ?? 0).toFixed(1)}%` }
