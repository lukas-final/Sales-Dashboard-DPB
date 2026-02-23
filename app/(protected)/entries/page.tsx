'use client'

import { useEffect, useState } from 'react'

type Closer = { id: string; name: string }
type Traffic = { id: string; entry_date: string; ad_spend: number; leads: number; scheduled: number; lost_at_scheduling: number }
type Sale = {
  id: string
  entry_date: string
  closer_id: string | null
  closers?: { name: string }[]
  no_shows: number
  result: 'FOLLOW_UP' | 'CLOSED' | 'LOST'
  follow_up_date?: string | null
  amount?: number | null
  payment_type?: 'FULL' | 'INSTALLMENT' | null
  installment_amount?: number | null
  installment_count?: number | null
}

export default function EntriesPage() {
  const [traffic, setTraffic] = useState<Traffic[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [closers, setClosers] = useState<Closer[]>([])

  const [editTrafficId, setEditTrafficId] = useState<string | null>(null)
  const [editSalesId, setEditSalesId] = useState<string | null>(null)

  const [tForm, setTForm] = useState({ entry_date: '', ad_spend: '', leads: '', scheduled: '', lost_at_scheduling: '' })
  const [sForm, setSForm] = useState({ entry_date: '', closer_id: '', attendance: 'ERSCHIENEN', result: 'FOLLOW_UP', follow_up_date: '', amount: '', payment_type: '', installment_amount: '', installment_count: '' })

  const load = async () => {
    const [t, s, c] = await Promise.all([
      fetch('/api/traffic?month=all').then((r) => r.json()),
      fetch('/api/sales?month=all').then((r) => r.json()),
      fetch('/api/closers').then((r) => r.json()),
    ])
    setTraffic(t)
    setSales(s)
    setClosers(c)
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

  const beginEditTraffic = (r: Traffic) => {
    setEditTrafficId(r.id)
    setTForm({
      entry_date: r.entry_date,
      ad_spend: String(r.ad_spend),
      leads: String(r.leads),
      scheduled: String(r.scheduled),
      lost_at_scheduling: String(r.lost_at_scheduling),
    })
  }

  const saveTraffic = async () => {
    if (!editTrafficId) return
    await fetch('/api/traffic', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editTrafficId, ...tForm }),
    })
    setEditTrafficId(null)
    load()
  }

  const beginEditSales = (r: Sale) => {
    setEditSalesId(r.id)
    setSForm({
      entry_date: r.entry_date,
      closer_id: r.closer_id || '',
      attendance: r.no_shows > 0 ? 'NO_SHOW' : 'ERSCHIENEN',
      result: r.result,
      follow_up_date: r.follow_up_date || '',
      amount: r.amount ? String(r.amount) : '',
      payment_type: r.payment_type || '',
      installment_amount: r.installment_amount ? String(r.installment_amount) : '',
      installment_count: r.installment_count ? String(r.installment_count) : '',
    })
  }

  const saveSales = async () => {
    if (!editSalesId) return
    await fetch('/api/sales', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editSalesId, ...sForm }),
    })
    setEditSalesId(null)
    load()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Einträge verwalten</h1>

      <section className="bg-slate-950/60 border border-slate-700 rounded-xl p-4 text-slate-100">
        <h2 className="font-semibold mb-3">Traffic-Einträge</h2>
        <div className="space-y-2 text-sm">
          {traffic.map((r) => (
            <div key={r.id} className="border border-slate-700 rounded p-3 bg-slate-900/70 space-y-2">
              {editTrafficId === r.id ? (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                  <input className="apple-input bg-slate-900 text-slate-100 border-slate-700" type="date" value={tForm.entry_date} onChange={(e) => setTForm({ ...tForm, entry_date: e.target.value })} />
                  <input className="apple-input bg-slate-900 text-slate-100 border-slate-700" value={tForm.ad_spend} onChange={(e) => setTForm({ ...tForm, ad_spend: e.target.value })} />
                  <input className="apple-input bg-slate-900 text-slate-100 border-slate-700" value={tForm.leads} onChange={(e) => setTForm({ ...tForm, leads: e.target.value })} />
                  <input className="apple-input bg-slate-900 text-slate-100 border-slate-700" value={tForm.scheduled} onChange={(e) => setTForm({ ...tForm, scheduled: e.target.value })} />
                  <input className="apple-input bg-slate-900 text-slate-100 border-slate-700" value={tForm.lost_at_scheduling} onChange={(e) => setTForm({ ...tForm, lost_at_scheduling: e.target.value })} />
                </div>
              ) : (
                <div>{r.entry_date} | Spend: {r.ad_spend} | Leads: {r.leads} | Terminiert: {r.scheduled} | Verloren: {r.lost_at_scheduling}</div>
              )}

              <div className="flex gap-2">
                {editTrafficId === r.id ? (
                  <>
                    <button onClick={saveTraffic} className="apple-btn-primary">Speichern</button>
                    <button onClick={() => setEditTrafficId(null)} className="apple-btn-secondary">Abbrechen</button>
                  </>
                ) : (
                  <button onClick={() => beginEditTraffic(r)} className="apple-btn-secondary">Bearbeiten</button>
                )}
                <button onClick={() => delTraffic(r.id)} className="apple-btn-secondary text-red-300">Löschen</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-950/60 border border-slate-700 rounded-xl p-4 text-slate-100">
        <h2 className="font-semibold mb-3">Closer-Einträge</h2>
        <div className="space-y-2 text-sm">
          {sales.map((r) => (
            <div key={r.id} className="border border-slate-700 rounded p-3 bg-slate-900/70 space-y-2">
              {editSalesId === r.id ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <input className="apple-input bg-slate-900 text-slate-100 border-slate-700" type="date" value={sForm.entry_date} onChange={(e) => setSForm({ ...sForm, entry_date: e.target.value })} />
                  <select className="apple-input bg-slate-900 text-slate-100 border-slate-700" value={sForm.closer_id} onChange={(e) => setSForm({ ...sForm, closer_id: e.target.value })}>
                    <option value="">Closer</option>
                    {closers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <select className="apple-input bg-slate-900 text-slate-100 border-slate-700" value={sForm.attendance} onChange={(e) => setSForm({ ...sForm, attendance: e.target.value })}>
                    <option value="NO_SHOW">No Show</option>
                    <option value="ERSCHIENEN">Erschienen</option>
                  </select>
                  <select className="apple-input bg-slate-900 text-slate-100 border-slate-700" value={sForm.result} onChange={(e) => setSForm({ ...sForm, result: e.target.value })}>
                    <option value="FOLLOW_UP">Follow Up</option>
                    <option value="LOST">Verloren</option>
                    <option value="CLOSED">Abschluss</option>
                  </select>

                  {sForm.result === 'FOLLOW_UP' ? (
                    <input className="apple-input bg-slate-900 text-slate-100 border-slate-700" type="date" value={sForm.follow_up_date} onChange={(e) => setSForm({ ...sForm, follow_up_date: e.target.value })} />
                  ) : null}

                  {sForm.result === 'CLOSED' ? (
                    <>
                      <input className="apple-input bg-slate-900 text-slate-100 border-slate-700" placeholder="Betrag" value={sForm.amount} onChange={(e) => setSForm({ ...sForm, amount: e.target.value })} />
                      <select className="apple-input bg-slate-900 text-slate-100 border-slate-700" value={sForm.payment_type} onChange={(e) => setSForm({ ...sForm, payment_type: e.target.value })}>
                        <option value="">Zahlungsart</option>
                        <option value="FULL">Vollzahler</option>
                        <option value="INSTALLMENT">Ratenzahler</option>
                      </select>
                      {sForm.payment_type === 'INSTALLMENT' ? (
                        <>
                          <input className="apple-input bg-slate-900 text-slate-100 border-slate-700" placeholder="Ratenhöhe" value={sForm.installment_amount} onChange={(e) => setSForm({ ...sForm, installment_amount: e.target.value })} />
                          <input className="apple-input bg-slate-900 text-slate-100 border-slate-700" placeholder="Anzahl Raten" value={sForm.installment_count} onChange={(e) => setSForm({ ...sForm, installment_count: e.target.value })} />
                        </>
                      ) : null}
                    </>
                  ) : null}
                </div>
              ) : (
                <div>{r.entry_date} | {r.closers?.[0]?.name || '-'} | Ergebnis: {r.result} | Betrag: {r.amount || 0} | {r.payment_type || '-'}</div>
              )}

              <div className="flex gap-2">
                {editSalesId === r.id ? (
                  <>
                    <button onClick={saveSales} className="apple-btn-primary">Speichern</button>
                    <button onClick={() => setEditSalesId(null)} className="apple-btn-secondary">Abbrechen</button>
                  </>
                ) : (
                  <button onClick={() => beginEditSales(r)} className="apple-btn-secondary">Bearbeiten</button>
                )}
                <button onClick={() => delSales(r.id)} className="apple-btn-secondary text-red-300">Löschen</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
