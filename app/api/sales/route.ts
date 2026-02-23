import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase-admin'

function validatePayload(b: Record<string, unknown>) {
  const entry_date = String(b.entry_date || '')
  const closer_id = String(b.closer_id || '')
  const attendance = String(b.attendance || '') as 'NO_SHOW' | 'ERSCHIENEN' | ''
  const result = String(b.result || '') as 'FOLLOW_UP' | 'CLOSED' | 'LOST' | ''
  const payment_type = String(b.payment_type || '') as 'FULL' | 'INSTALLMENT' | ''
  const follow_up_date = String(b.follow_up_date || '')

  if (!entry_date) return { error: 'entry_date required' }
  if (!closer_id) return { error: 'closer_id required' }
  if (!attendance) return { error: 'attendance required' }
  if (attendance === 'ERSCHIENEN' && !result) return { error: 'result required after erschienen' }
  if (result === 'FOLLOW_UP' && !follow_up_date) return { error: 'follow_up_date required for follow up' }

  const amount = b.amount === null || b.amount === '' || b.amount === undefined ? null : Number(b.amount)
  const installment_amount = b.installment_amount === null || b.installment_amount === '' || b.installment_amount === undefined ? null : Number(b.installment_amount)
  const installment_count = b.installment_count === null || b.installment_count === '' || b.installment_count === undefined ? null : Number(b.installment_count)

  if (result === 'CLOSED') {
    if (!amount || amount <= 0) return { error: 'amount required for closed deals' }
    if (!payment_type) return { error: 'payment_type required for closed deals' }
    if (payment_type === 'INSTALLMENT' && (!installment_amount || !installment_count)) {
      return { error: 'installment_amount and installment_count required for installment deals' }
    }
  }

  return {
    payload: {
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
      follow_up_date: result === 'FOLLOW_UP' ? follow_up_date : null,
    },
  }
}

export async function GET(req: Request) {
  const user = getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const month = searchParams.get('month')
  const sb = supabaseAdmin()
  let q = sb.from('sales_entries').select('*, closers(name)').order('entry_date', { ascending: false })
  if (month && month !== 'all') q = q.eq('month_key', month)
  if (user.role === 'CLOSER' && user.closerId) q = q.eq('closer_id', user.closerId)

  const { data, error } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const user = getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const b = (await req.json()) as Record<string, unknown>
  if (user.role === 'CLOSER') b.closer_id = user.closerId || ''

  const validated = validatePayload(b)
  if ('error' in validated) return NextResponse.json({ error: validated.error }, { status: 400 })

  const sb = supabaseAdmin()
  const { data, error } = await sb.from('sales_entries').insert(validated.payload).select('*').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PUT(req: Request) {
  const user = getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const b = (await req.json()) as Record<string, unknown>
  const id = String(b.id || '')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  if (user.role === 'CLOSER') b.closer_id = user.closerId || ''

  const validated = validatePayload(b)
  if ('error' in validated) return NextResponse.json({ error: validated.error }, { status: 400 })

  const sb = supabaseAdmin()
  let q = sb.from('sales_entries').update(validated.payload).eq('id', id)
  if (user.role === 'CLOSER' && user.closerId) q = q.eq('closer_id', user.closerId)
  const { data, error } = await q.select('*').single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req: Request) {
  const user = getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const sb = supabaseAdmin()
  let q = sb.from('sales_entries').delete().eq('id', id)
  if (user.role === 'CLOSER' && user.closerId) q = q.eq('closer_id', user.closerId)
  const { error } = await q

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
