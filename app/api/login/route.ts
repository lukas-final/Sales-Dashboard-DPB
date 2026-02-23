import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const username = String(body?.username || '').trim().toLowerCase()
  const password = String(body?.password || '').trim()

  if (!username || !password) {
    return NextResponse.json({ error: 'Username und Passwort erforderlich' }, { status: 400 })
  }

  const sb = supabaseAdmin()
  const { data, error } = await sb
    .from('users')
    .select('username,password,role,closer_id,active')
    .eq('username', username)
    .single()

  if (error || !data || !data.active) {
    return NextResponse.json({ error: 'Ungültige Login-Daten' }, { status: 401 })
  }

  const expectedPassword = String(data.password || '').trim()
  const okPassword = data.role === 'CLOSER'
    ? expectedPassword.toLowerCase() === password.toLowerCase()
    : expectedPassword === password

  if (!okPassword) {
    return NextResponse.json({ error: 'Ungültige Login-Daten' }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true, role: data.role })
  const base = { httpOnly: true, sameSite: 'lax' as const, secure: true, path: '/' }
  res.cookies.set('sdpb_user', String(data.username), base)
  res.cookies.set('sdpb_role', String(data.role), base)
  res.cookies.set('sdpb_closer', String(data.closer_id || ''), base)
  return res
}
