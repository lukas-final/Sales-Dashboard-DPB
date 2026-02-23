import { NextResponse } from 'next/server'
import { isAuthed } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase-admin'

type Row = {
  ad_spend: number | null
  leads: number | null
  appointments: number | null
  no_shows: number | null
  lost_at_scheduling: number | null
  result: 'FOLLOW_UP' | 'CLOSED' | 'LOST'
  amount: number | null
  payment_type: 'FULL' | 'INSTALLMENT' | null
  closers: { name: string } | null
}

type Acc = { total: number; followUp: number; closed: number; lost: number; revenue: number; full: number; installment: number }

export async function GET(req: Request) {
  if (!isAuthed()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const month = searchParams.get('month')
  const sb = supabaseAdmin()

  let q = sb.from('sales_entries').select('*, closers(name)')
  if (month && month !== 'all') q = q.eq('month_key', month)

  const { data, error } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const rows = (data ?? []) as Row[]
  const sum = (arr: Row[], fn: (r: Row) => number) => arr.reduce((a, c) => a + fn(c), 0)
  const adSpend = sum(rows, (r) => Number(r.ad_spend || 0))
  const leads = sum(rows, (r) => Number(r.leads || 0))
  const appointments = sum(rows, (r) => Number(r.appointments || 0))
  const noShows = sum(rows, (r) => Number(r.no_shows || 0))
  const lostAtScheduling = sum(rows, (r) => Number(r.lost_at_scheduling || 0))
  const closed = rows.filter((r) => r.result === 'CLOSED')
  const totalRevenue = closed.reduce((a, c) => a + Number(c.amount || 0), 0)
  const noShowQuote = appointments > 0 ? (noShows / appointments) * 100 : 0
  const roi = adSpend > 0 ? ((totalRevenue - adSpend) / adSpend) * 100 : 0
  const avgDeal = closed.length ? totalRevenue / closed.length : 0

  const byCloser: Record<string, Acc> = {}
  for (const r of rows) {
    const name = r.closers?.name || 'Unknown'
    byCloser[name] ||= { total: 0, followUp: 0, closed: 0, lost: 0, revenue: 0, full: 0, installment: 0 }
    byCloser[name].total += 1
    if (r.result === 'FOLLOW_UP') byCloser[name].followUp += 1
    if (r.result === 'CLOSED') {
      byCloser[name].closed += 1
      byCloser[name].revenue += Number(r.amount || 0)
      if (r.payment_type === 'FULL') byCloser[name].full += Number(r.amount || 0)
      if (r.payment_type === 'INSTALLMENT') byCloser[name].installment += Number(r.amount || 0)
    }
    if (r.result === 'LOST') byCloser[name].lost += 1
  }

  const closerStats = Object.entries(byCloser).map(([name, v]) => ({
    name,
    ...v,
    closeRate: v.total ? (v.closed / v.total) * 100 : 0,
    followUpRate: v.total ? (v.followUp / v.total) * 100 : 0,
    lostRate: v.total ? (v.lost / v.total) * 100 : 0,
  }))

  return NextResponse.json({
    totals: { adSpend, leads, appointments, noShows, noShowQuote, lostAtScheduling, totalRevenue, closes: closed.length, avgDeal, roi },
    closerStats,
  })
}
