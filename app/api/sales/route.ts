import { NextResponse } from 'next/server'
import { isAuthed } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(req: Request) {
  if (!isAuthed()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const month = searchParams.get('month')
  const sb = supabaseAdmin()
  let q = sb.from('sales_entries').select('*, closers(name)').order('entry_date', { ascending: false })
  if (month && month !== 'all') q = q.eq('month_key', month)
  const { data, error } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  if (!isAuthed()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const b = await req.json()

  const entry_date = String(b.entry_date || '')
  if (!entry_date) return NextResponse.json({ error: 'entry_date required' }, { status: 400 })

  const flow = String(b.flow || 'LOST_SCHED') as 'TERMINIERT' | 'LOST_SCHED'
  const attendance = String(b.attendance || '') as 'NO_SHOW' | 'ERSCHIENEN' | ''
  const result = String(b.result || '') as 'FOLLOW_UP' | 'CLOSED' | 'LOST' | ''
  const payment_type = String(b.payment_type || '') as 'FULL' | 'INSTALLMENT' | ''
  const amount = b.amount === null || b.amount === '' || b.amount === undefined ? null : Number(b.amount)
  const installment_amount = b.installment_amount === null || b.installment_amount === '' || b.installment_amount === undefined ? null : Number(b.installment_amount)
  const installment_count = b.installment_count === null || b.installment_count === '' || b.installment_count === undefined ? null : Number(b.installment_count)

  if (flow === 'TERMINIERT' && !b.closer_id) {
    return NextResponse.json({ error: 'closer_id required when lead is terminiert' }, { status: 400 })
  }
  if (flow === 'TERMINIERT' && !attendance) {
    return NextResponse.json({ error: 'attendance required' }, { status: 400 })
  }
  if (flow === 'TERMINIERT' && attendance === 'ERSCHIENEN' && !result) {
    return NextResponse.json({ error: 'result required after erschienen' }, { status: 400 })
  }
  if (result === 'CLOSED') {
    if (!amount || amount <= 0) return NextResponse.json({ error: 'amount required for closed deals' }, { status: 400 })
    if (!payment_type) return NextResponse.json({ error: 'payment_type required for closed deals' }, { status: 400 })
    if (payment_type === 'INSTALLMENT' && (!installment_amount || !installment_count)) {
      return NextResponse.json({ error: 'installment_amount and installment_count required for installment deals' }, { status: 400 })
    }
  }

  const month_key = entry_date.slice(0, 7)
  const payload = {
    entry_date,
    month_key,
    ad_spend: Number(b.ad_spend || 0),
    leads: 1,
    appointments: flow === 'TERMINIERT' ? 1 : 0,
    no_shows: attendance === 'NO_SHOW' ? 1 : 0,
    lost_at_scheduling: flow === 'LOST_SCHED' ? 1 : 0,
    closer_id: flow === 'TERMINIERT' ? b.closer_id : null,
    result: attendance === 'ERSCHIENEN' ? result : (attendance === 'NO_SHOW' ? 'LOST' : 'LOST'),
    amount: result === 'CLOSED' ? amount : null,
    payment_type: result === 'CLOSED' ? payment_type : null,
    installment_amount: result === 'CLOSED' && payment_type === 'INSTALLMENT' ? installment_amount : null,
    installment_count: result === 'CLOSED' && payment_type === 'INSTALLMENT' ? installment_count : null,
  }

  const sb = supabaseAdmin()
  const { data, error } = await sb.from('sales_entries').insert(payload).select('*').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
