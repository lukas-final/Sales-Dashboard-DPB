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
  const entry_date = String(b.entry_date)
  const month_key = entry_date.slice(0, 7)
  const payload = {
    entry_date,
    month_key,
    ad_spend: Number(b.ad_spend || 0),
    leads: Number(b.leads || 0),
    appointments: Number(b.appointments || 0),
    no_shows: Number(b.no_shows || 0),
    lost_at_scheduling: Number(b.lost_at_scheduling || 0),
    closer_id: b.closer_id,
    result: b.result,
    amount: b.amount ? Number(b.amount) : null,
    payment_type: b.payment_type || null,
  }
  const sb = supabaseAdmin()
  const { data, error } = await sb.from('sales_entries').insert(payload).select('*').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
