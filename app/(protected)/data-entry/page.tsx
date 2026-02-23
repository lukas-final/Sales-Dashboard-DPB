'use client'

import { useEffect, useState } from 'react'

type Closer = { id: string; name: string }
type Attendance = 'NO_SHOW' | 'ERSCHIENEN' | ''
type Outcome = 'FOLLOW_UP' | 'CLOSED' | 'LOST' | ''
type Payment = 'FULL' | 'INSTALLMENT' | ''

export default function DataEntryPage() {
  const [role, setRole] = useState<'ADMIN' | 'CLOSER'>('ADMIN')
  const [myCloserId, setMyCloserId] = useState('')
  const [closers, setClosers] = useState<Closer[]>([])
  const [entryDate] = useState(new Date().toISOString().slice(0, 10))
  const [trafficMonth, setTrafficMonth] = useState(new Date().toISOString().slice(0, 7))

  // Block A: traffic / top funnel
  const [adSpend, setAdSpend] = useState('')
  const [leads, setLeads] = useState('')
  const [scheduled, setScheduled] = useState('')
  const [lostScheduling, setLostScheduling] = useState('')

  // Block B: closer pipeline (one terminierter kontakt)
  const [closerId, setCloserId] = useState('')
  const [attendance, setAttendance] = useState<Attendance>('')
  const [outcome, setOutcome] = useState<Outcome>('')
  const [paymentType, setPaymentType] = useState<Payment>('')
  const [followUpDate, setFollowUpDate] = useState('')
  const [amount, setAmount] = useState('')
  const [installmentAmount, setInstallmentAmount] = useState('')
  const [installmentCount, setInstallmentCount] = useState('')

  const [errorA, setErrorA] = useState('')
  const [errorB, setErrorB] = useState('')

  useEffect(() => {
    fetch('/api/me').then((r) => r.json()).then((u) => {
      if (u?.role) setRole(u.role)
      if (u?.closerId) {
        setMyCloserId(u.closerId)
        setCloserId(u.closerId)
      }
    })

    fetch('/api/closers')
      .then((r) => r.json())
      .then((d: Closer[]) => {
        setClosers(d)
        if (d?.[0] && !myCloserId) setCloserId(d[0].id)
      })
  }, [myCloserId])

  const submitTraffic = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorA('')
    const res = await fetch('/api/traffic', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        entry_date: `${trafficMonth}-01`,
        ad_spend: adSpend === '' ? 0 : Number(adSpend),
        leads: leads === '' ? 0 : Number(leads),
        scheduled: scheduled === '' ? 0 : Number(scheduled),
        lost_at_scheduling: lostScheduling === '' ? 0 : Number(lostScheduling),
      }),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({ error: 'Fehler' }))
      setErrorA(body.error || 'Fehler beim Speichern')
      return
    }
    alert('Traffic gespeichert')
  }

  const submitCloser = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorB('')

    const payload = {
      entry_date: entryDate,
      closer_id: closerId,
      attendance,
      result: outcome,
      payment_type: paymentType,
      follow_up_date: followUpDate || null,
      amount: amount === '' ? null : Number(amount),
      installment_amount: installmentAmount === '' ? null : Number(installmentAmount),
      installment_count: installmentCount === '' ? null : Number(installmentCount),
    }

    const res = await fetch('/api/sales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({ error: 'Fehler' }))
      setErrorB(body.error || 'Fehler beim Speichern')
      return
    }

    alert('Closer-Eintrag gespeichert')
    setAttendance('')
    setOutcome('')
    setPaymentType('')
    setFollowUpDate('')
    setAmount('')
    setInstallmentAmount('')
    setInstallmentCount('')
  }

  return (
    <div className="max-w-5xl w-full overflow-x-hidden space-y-5">
      <h1 className="text-2xl font-bold">Dateneingabe</h1>

      {role === 'ADMIN' ? (
      <section className="bg-slate-950/60 border border-slate-700 rounded-xl p-4 space-y-3 text-slate-100">
        <h2 className="font-semibold">A) Ad Spend + Lead Eingang (unabhängig vom Verkauf)</h2>
        <form onSubmit={submitTraffic} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="Monat">
              <input type="month" value={trafficMonth} onChange={(e) => setTrafficMonth(e.target.value)} className="w-full min-w-0 max-w-full bg-slate-900 text-slate-100 border border-slate-700 rounded px-3 py-2 appearance-none" />
            </Field>
            <Field label="Ad Spend (Monat)">
              <input type="number" value={adSpend} onChange={(e) => setAdSpend(e.target.value)} className="w-full bg-slate-900 text-slate-100 placeholder:text-slate-400 border border-slate-700 rounded px-3 py-2" />
            </Field>
            <Field label="Lead Eingang gesamt">
              <input type="number" value={leads} onChange={(e) => setLeads(e.target.value)} className="w-full bg-slate-900 text-slate-100 placeholder:text-slate-400 border border-slate-700 rounded px-3 py-2" />
            </Field>
            <Field label="Terminiert gesamt">
              <input type="number" value={scheduled} onChange={(e) => setScheduled(e.target.value)} className="w-full bg-slate-900 text-slate-100 placeholder:text-slate-400 border border-slate-700 rounded px-3 py-2" />
            </Field>
            <Field label="Verloren in Terminierung">
              <input type="number" value={lostScheduling} onChange={(e) => setLostScheduling(e.target.value)} className="w-full bg-slate-900 text-slate-100 placeholder:text-slate-400 border border-slate-700 rounded px-3 py-2" />
            </Field>
          </div>
          {errorA ? <p className="text-sm text-red-600">{errorA}</p> : null}
          <button className="bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2">Traffic speichern</button>
        </form>
      </section>
      ) : null}

      <section className="bg-slate-950/60 border border-slate-700 rounded-xl p-4 space-y-3 text-slate-100">
        <h2 className="font-semibold">B) Terminierter Kontakt bei Closer (separate Statistik)</h2>
        <form onSubmit={submitCloser} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {role === 'ADMIN' ? (
              <Select label="Closer" value={closerId} onChange={setCloserId} options={closers.map((c) => ({ v: c.id, l: c.name }))} />
            ) : (
              <Field label="Closer">
                <input value={closers.find(c => c.id === closerId)?.name || 'Mein Account'} disabled className="w-full bg-slate-900 text-slate-100 border border-slate-700 rounded px-3 py-2" />
              </Field>
            )}
            <Select label="No Show oder Erschienen" value={attendance} onChange={(v) => { setAttendance(v as Attendance); setOutcome(''); setPaymentType('') }} options={[{ v: 'NO_SHOW', l: 'No Show' }, { v: 'ERSCHIENEN', l: 'Erschienen' }]} />
          </div>

          {attendance === 'ERSCHIENEN' ? (
            <Select label="Ergebnis" value={outcome} onChange={(v) => { setOutcome(v as Outcome); setPaymentType('') }} options={[{ v: 'FOLLOW_UP', l: 'Follow Up' }, { v: 'LOST', l: 'Verloren' }, { v: 'CLOSED', l: 'Abschluss' }]} />
          ) : null}

          {attendance === 'ERSCHIENEN' && outcome === 'FOLLOW_UP' ? (
            <Field label="Follow-Up Termin">
              <input type="date" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} className="w-full bg-slate-900 text-slate-100 placeholder:text-slate-400 border border-slate-700 rounded px-3 py-2" />
            </Field>
          ) : null}

          {attendance === 'ERSCHIENEN' && outcome === 'CLOSED' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Select label="Zahlungsart" value={paymentType} onChange={(v) => setPaymentType(v as Payment)} options={[{ v: 'FULL', l: 'Vollzahler' }, { v: 'INSTALLMENT', l: 'Ratenzahler' }]} />
              <Field label="Gesamthöhe Abschluss (€)">
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-slate-900 text-slate-100 placeholder:text-slate-400 border border-slate-700 rounded px-3 py-2" />
              </Field>
              {paymentType === 'INSTALLMENT' ? (
                <>
                  <Field label="Ratenhöhe (€)">
                    <input type="number" value={installmentAmount} onChange={(e) => setInstallmentAmount(e.target.value)} className="w-full bg-slate-900 text-slate-100 placeholder:text-slate-400 border border-slate-700 rounded px-3 py-2" />
                  </Field>
                  <Field label="Anzahl Raten">
                    <input type="number" value={installmentCount} onChange={(e) => setInstallmentCount(e.target.value)} className="w-full bg-slate-900 text-slate-100 placeholder:text-slate-400 border border-slate-700 rounded px-3 py-2" />
                  </Field>
                </>
              ) : null}
            </div>
          ) : null}

          {errorB ? <p className="text-sm text-red-600">{errorB}</p> : null}
          <button className="bg-green-600 hover:bg-green-700 text-white rounded px-4 py-2">Closer-Eintrag speichern</button>
        </form>
      </section>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="text-sm block">{label}{children}</label>
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: Array<{ v: string; l: string }> }) {
  return (
    <label className="text-sm block">
      {label}
      <select className="w-full bg-slate-900 text-slate-100 placeholder:text-slate-400 border border-slate-700 rounded px-3 py-2" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Bitte wählen</option>
        {options.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    </label>
  )
}
