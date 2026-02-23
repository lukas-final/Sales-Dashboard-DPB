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
  const closer_id = String(b.closer_id || '')
  const attendance = String(b.attendance || '') as 'NO_SHOW' | 'ERSCHIENEN' | ''
  const result = String(b.result || '') as 'FOLLOW_UP' | 'CLOSED' | 'LOST' | ''
  const payment_type = String(b.payment_type || '') as 'FULL' | 'INSTALLMENT' | ''

  if (!entry_date) return NextResponse.json({ error: 'entry_date required' }, { status: 400 })
  if (!closer_id) return NextResponse.json({ error: 'closer_id required' }, { status: 400 })
  if (!attendance) return NextResponse.json({ error: 'attendance required' }, { status: 400 })
  if (attendance === 'ERSCHIENEN' && !result) return NextResponse.json({ error: 'result required after erschienen' }, { status: 400 })

  const amount = b.amount === null || b.amount === '' || b.amount === undefined ? null : Number(b.amount)
  const installment_amount = b.installment_amount === null || b.installment_amount === '' || b.installment_amount === undefined ? null : Number(b.installment_amount)
  const installment_count = b.installment_count === null || b.installment_count === '' || b.installment_count === undefined ? null : Number(b.installment_count)

  if (result === 'CLOSED') {
    if (!amount || amount <= 0) return NextResponse.json({ error: 'amount required for closed deals' }, { status: 400 })
    if (!payment_type) return NextResponse.json({ error: 'payment_type required for closed deals' }, { status: 400 })
    if (payment_type === 'INSTALLMENT' && (!installment_amount || !installment_count)) {
      return NextResponse.json({ error: 'installment_amount and installment_count required for installment deals' }, { status: 400 })
    }
  }

  const payload = {
    entry_date,
    month_key: entry_date.slice(0, 7),
    ad_spend: 0,
    leads: 0,
    appointments: 1,
    no_shows: attendance === 'NO_SHOW' ? 1 : 0,
    lost_at_scheduling: 0,
    closer_id,
    result: attendance === 'NO_SHOW' ? 'LOST' : result,
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
