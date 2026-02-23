import { NextResponse } from 'next/server'
import { isAuthed } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase-admin'

type SalesRow = {
  closer_id: string | null
  appointments: number | null
  no_shows: number | null
  result: 'FOLLOW_UP' | 'CLOSED' | 'LOST'
  amount: number | null
  payment_type: 'FULL' | 'INSTALLMENT' | null
}

type TrafficRow = {
  ad_spend: number | null
  leads: number | null
  scheduled: number | null
  lost_at_scheduling: number | null
}

type Acc = { total: number; followUp: number; closed: number; lost: number; revenue: number; full: number; installment: number }

export async function GET(req: Request) {
  if (!isAuthed()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const month = searchParams.get('month')
  const sb = supabaseAdmin()

  let salesQ = sb.from('sales_entries').select('closer_id,appointments,no_shows,result,amount,payment_type')
  let trafficQ = sb.from('traffic_entries').select('ad_spend,leads,scheduled,lost_at_scheduling')
  const closersQ = sb.from('closers').select('id,name')
  if (month && month !== 'all') {
    salesQ = salesQ.eq('month_key', month)
    trafficQ = trafficQ.eq('month_key', month)
  }

  const [salesRes, trafficRes, closersRes] = await Promise.all([salesQ, trafficQ, closersQ])
  if (salesRes.error) return NextResponse.json({ error: salesRes.error.message }, { status: 500 })
  if (trafficRes.error) return NextResponse.json({ error: trafficRes.error.message }, { status: 500 })
  if (closersRes.error) return NextResponse.json({ error: closersRes.error.message }, { status: 500 })

  const salesRows = (salesRes.data ?? []) as SalesRow[]
  const trafficRows = (trafficRes.data ?? []) as TrafficRow[]
  const closerMap = new Map<string, string>((closersRes.data ?? []).map((c: { id: string; name: string }) => [c.id, c.name]))

  const sumSales = (fn: (r: SalesRow) => number) => salesRows.reduce((a, c) => a + fn(c), 0)
  const sumTraffic = (fn: (r: TrafficRow) => number) => trafficRows.reduce((a, c) => a + fn(c), 0)

  const adSpend = sumTraffic((r) => Number(r.ad_spend || 0))
  const leads = sumTraffic((r) => Number(r.leads || 0))
  const scheduled = sumTraffic((r) => Number(r.scheduled || 0))
  const lostAtScheduling = sumTraffic((r) => Number(r.lost_at_scheduling || 0))

  const appointments = sumSales((r) => Number(r.appointments || 0))
  const noShows = sumSales((r) => Number(r.no_shows || 0))
  const closed = salesRows.filter((r) => r.result === 'CLOSED')
  const totalRevenue = closed.reduce((a, c) => a + Number(c.amount || 0), 0)
  const noShowQuote = appointments > 0 ? (noShows / appointments) * 100 : 0
  const roi = adSpend > 0 ? ((totalRevenue - adSpend) / adSpend) * 100 : 0
  const avgDeal = closed.length ? totalRevenue / closed.length : 0

  const byCloser: Record<string, Acc> = {}
  for (const r of salesRows) {
    const name = r.closer_id ? (closerMap.get(r.closer_id) || 'Unknown') : 'Unknown'
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
    totals: {
      adSpend,
      leads,
      scheduled,
      lostAtScheduling,
      appointments,
      noShows,
      noShowQuote,
      totalRevenue,
      closes: closed.length,
      avgDeal,
      roi,
    },
    closerStats,
  })
}
