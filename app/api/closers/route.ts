import { NextResponse } from 'next/server'
import { isAuthed } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET() {
  if (!isAuthed()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const sb = supabaseAdmin()
  const { data, error } = await sb.from('closers').select('*').order('name')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  if (!isAuthed()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const name = String(body?.name || '').trim()
  if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 })
  const sb = supabaseAdmin()
  const { data, error } = await sb.from('closers').insert({ name }).select('*').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
