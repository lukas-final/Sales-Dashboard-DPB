import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(req: Request) {
  const user = getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { searchParams } = new URL(req.url)
  const month = searchParams.get('month')
  const sb = supabaseAdmin()
  let q = sb.from('traffic_entries').select('*').order('entry_date', { ascending: false })
  if (month && month !== 'all') q = q.eq('month_key', month)
  const { data, error } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const user = getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const b = await req.json()
  const entry_date = String(b.entry_date || '')
  if (!entry_date) return NextResponse.json({ error: 'entry_date required' }, { status: 400 })

  const payload = {
    entry_date,
    month_key: entry_date.slice(0, 7),
    ad_spend: Number(b.ad_spend || 0),
    leads: Number(b.leads || 0),
    scheduled: Number(b.scheduled || 0),
    lost_at_scheduling: Number(b.lost_at_scheduling || 0),
  }

  const sb = supabaseAdmin()
  const { data, error } = await sb.from('traffic_entries').insert(payload).select('*').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PUT(req: Request) {
  const user = getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const b = await req.json()
  const id = String(b.id || '')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const entry_date = String(b.entry_date || '')
  const payload = {
    ...(entry_date ? { entry_date, month_key: entry_date.slice(0, 7) } : {}),
    ...(b.ad_spend !== undefined ? { ad_spend: Number(b.ad_spend || 0) } : {}),
    ...(b.leads !== undefined ? { leads: Number(b.leads || 0) } : {}),
    ...(b.scheduled !== undefined ? { scheduled: Number(b.scheduled || 0) } : {}),
    ...(b.lost_at_scheduling !== undefined ? { lost_at_scheduling: Number(b.lost_at_scheduling || 0) } : {}),
  }

  const sb = supabaseAdmin()
  const { data, error } = await sb.from('traffic_entries').update(payload).eq('id', id).select('*').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req: Request) {
  const user = getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  const sb = supabaseAdmin()
  const { error } = await sb.from('traffic_entries').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
