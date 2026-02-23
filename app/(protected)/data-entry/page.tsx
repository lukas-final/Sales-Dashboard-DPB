'use client'

import { useEffect, useState } from 'react'

type Closer = { id: string; name: string }
type EntryForm = {
  entry_date: string
  ad_spend: number
  leads: number
  appointments: number
  no_shows: number
  lost_at_scheduling: number
  closer_id: string
  result: 'FOLLOW_UP' | 'CLOSED' | 'LOST'
  amount: string
  payment_type: 'FULL' | 'INSTALLMENT'
}

export default function DataEntryPage() {
  const [closers, setClosers] = useState<Closer[]>([])
  const [form, setForm] = useState<EntryForm>({
    entry_date: new Date().toISOString().slice(0,10), ad_spend: 0, leads: 0, appointments: 0, no_shows: 0, lost_at_scheduling: 0,
    closer_id: '', result: 'FOLLOW_UP', amount: '', payment_type: 'FULL'
  })

  useEffect(() => {
    fetch('/api/closers').then(r=>r.json()).then((d: Closer[])=>{ setClosers(d); if (d?.[0]) setForm((f)=>({...f, closer_id: d[0].id })) })
  }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = { ...form, amount: form.amount === '' ? null : Number(form.amount) }
    const res = await fetch('/api/sales', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) })
    if (res.ok) alert('Gespeichert')
    else alert('Fehler')
  }

  return (
    <form onSubmit={submit} className="max-w-2xl space-y-3">
      <h1 className="text-2xl font-bold">Dateneingabe</h1>
      <Grid>
        <Input label="Datum" type="date" value={form.entry_date} onChange={(v)=>setForm({...form, entry_date:v})} />
        <Input label="Ad Spend" type="number" value={form.ad_spend} onChange={(v)=>setForm({...form, ad_spend:Number(v)})} />
        <Input label="Lead Eingang" type="number" value={form.leads} onChange={(v)=>setForm({...form, leads:Number(v)})} />
        <Input label="Termine gesetzt" type="number" value={form.appointments} onChange={(v)=>setForm({...form, appointments:Number(v)})} />
        <Input label="No Shows" type="number" value={form.no_shows} onChange={(v)=>setForm({...form, no_shows:Number(v)})} />
        <Input label="Verloren bei Terminierung" type="number" value={form.lost_at_scheduling} onChange={(v)=>setForm({...form, lost_at_scheduling:Number(v)})} />
      </Grid>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <label className="text-sm">Closer
          <select className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-2" value={form.closer_id} onChange={(e)=>setForm({...form, closer_id:e.target.value})}>
            {closers.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <label className="text-sm">Ergebnis
          <select className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-2" value={form.result} onChange={(e)=>setForm({...form, result:e.target.value as EntryForm['result']})}>
            <option value="FOLLOW_UP">Follow Up</option>
            <option value="CLOSED">Abschluss</option>
            <option value="LOST">Verloren</option>
          </select>
        </label>
        <label className="text-sm">Zahlungsart
          <select className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-2" value={form.payment_type} onChange={(e)=>setForm({...form, payment_type:e.target.value as EntryForm['payment_type']})}>
            <option value="FULL">Vollzahler</option>
            <option value="INSTALLMENT">Ratenzahler</option>
          </select>
        </label>
      </div>

      {form.result === 'CLOSED' && <Input label="Abschlussbetrag" type="number" value={form.amount} onChange={(v)=>setForm({...form, amount:v})} />}
      <button className="bg-blue-600 hover:bg-blue-500 rounded px-4 py-2">Eintrag speichern</button>
    </form>
  )
}

function Grid({ children }: { children: React.ReactNode }) { return <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{children}</div> }
function Input({ label, value, onChange, type='text' }: { label:string; value:string|number; onChange:(v:string)=>void; type?:string }) {
  return <label className="text-sm">{label}<input type={type} className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-2" value={value} onChange={(e)=>onChange(e.target.value)} /></label>
}
