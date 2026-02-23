'use client'

import { useEffect, useState } from 'react'

type Closer = { id: string; name: string }
type Flow = 'TERMINIERT' | 'LOST_SCHED'
type Attendance = 'NO_SHOW' | 'ERSCHIENEN' | ''
type Outcome = 'FOLLOW_UP' | 'CLOSED' | 'LOST' | ''
type Payment = 'FULL' | 'INSTALLMENT' | ''

export default function DataEntryPage() {
  const [closers, setClosers] = useState<Closer[]>([])
  const [entryDate, setEntryDate] = useState(new Date().toISOString().slice(0, 10))
  const [adSpend, setAdSpend] = useState(0)
  const [flow, setFlow] = useState<Flow>('TERMINIERT')
  const [closerId, setCloserId] = useState('')
  const [attendance, setAttendance] = useState<Attendance>('')
  const [outcome, setOutcome] = useState<Outcome>('')
  const [paymentType, setPaymentType] = useState<Payment>('')
  const [amount, setAmount] = useState('')
  const [installmentAmount, setInstallmentAmount] = useState('')
  const [installmentCount, setInstallmentCount] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/closers')
      .then((r) => r.json())
      .then((d: Closer[]) => {
        setClosers(d)
        if (d?.[0]) setCloserId(d[0].id)
      })
  }, [])

  const canShowAttendance = flow === 'TERMINIERT'
  const canShowOutcome = flow === 'TERMINIERT' && attendance === 'ERSCHIENEN'
  const canShowPayment = canShowOutcome && outcome === 'CLOSED'

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const payload = {
      entry_date: entryDate,
      ad_spend: adSpend,
      flow,
      closer_id: closerId,
      attendance,
      result: outcome,
      payment_type: paymentType,
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
      setError(body.error || 'Fehler beim Speichern')
      return
    }

    alert('Lead gespeichert')
    setAttendance('')
    setOutcome('')
    setPaymentType('')
    setAmount('')
    setInstallmentAmount('')
    setInstallmentCount('')
  }

  return (
    <form onSubmit={submit} className="max-w-3xl space-y-4">
      <h1 className="text-2xl font-bold">Dateneingabe (Ablauf)</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label="Datum">
          <input type="date" value={entryDate} onChange={(e) => setEntryDate(e.target.value)} className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2" />
        </Field>
        <Field label="Ad Spend (Tag)">
          <input type="number" value={adSpend} onChange={(e) => setAdSpend(Number(e.target.value))} className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2" />
        </Field>
      </div>

      <Step title="1) Lead Eingang → Terminiert oder Verloren in Terminierung">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Select label="Lead Status" value={flow} onChange={(v) => setFlow(v as Flow)} options={[{ v: 'TERMINIERT', l: 'Terminiert bei Closer' }, { v: 'LOST_SCHED', l: 'Verloren in Terminierung' }]} />
          {flow === 'TERMINIERT' ? (
            <Select label="Closer" value={closerId} onChange={setCloserId} options={closers.map((c) => ({ v: c.id, l: c.name }))} />
          ) : null}
        </div>
      </Step>

      {canShowAttendance ? (
        <Step title="2) Bei terminiert → No Show oder Erschienen">
          <Select label="Attendance" value={attendance} onChange={(v) => { setAttendance(v as Attendance); setOutcome(''); setPaymentType('') }} options={[{ v: 'NO_SHOW', l: 'No Show' }, { v: 'ERSCHIENEN', l: 'Erschienen' }]} />
        </Step>
      ) : null}

      {canShowOutcome ? (
        <Step title="3) Bei erschienen → Ergebnis">
          <Select label="Ergebnis" value={outcome} onChange={(v) => { setOutcome(v as Outcome); setPaymentType('') }} options={[{ v: 'FOLLOW_UP', l: 'Follow Up' }, { v: 'LOST', l: 'Verloren' }, { v: 'CLOSED', l: 'Abschluss' }]} />
        </Step>
      ) : null}

      {canShowPayment ? (
        <Step title="4) Bei Abschluss → Vollzahler oder Ratenzahler">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Select label="Zahlungsart" value={paymentType} onChange={(v) => setPaymentType(v as Payment)} options={[{ v: 'FULL', l: 'Vollzahler' }, { v: 'INSTALLMENT', l: 'Ratenzahler' }]} />
            <Field label="Abschlussbetrag (€)">
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2" />
            </Field>
          </div>
          {paymentType === 'INSTALLMENT' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="Ratenhöhe (€)">
                <input type="number" value={installmentAmount} onChange={(e) => setInstallmentAmount(e.target.value)} className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2" />
              </Field>
              <Field label="Anzahl Raten">
                <input type="number" value={installmentCount} onChange={(e) => setInstallmentCount(e.target.value)} className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2" />
              </Field>
            </div>
          ) : null}
        </Step>
      ) : null}

      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      <button className="bg-blue-600 hover:bg-blue-500 rounded px-4 py-2">Eintrag speichern</button>
    </form>
  )
}

function Step({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-3">
      <h2 className="font-semibold">{title}</h2>
      {children}
    </section>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="text-sm block">{label}{children}</label>
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: Array<{ v: string; l: string }> }) {
  return (
    <label className="text-sm block">
      {label}
      <select className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Bitte wählen</option>
        {options.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    </label>
  )
}
