import { NextResponse } from 'next/server'

export async function POST() {
  const res = NextResponse.json({ ok: true })
  const base = { httpOnly: true, sameSite: 'lax' as const, secure: true, path: '/', maxAge: 0 }
  res.cookies.set('sdpb_user', '', base)
  res.cookies.set('sdpb_role', '', base)
  res.cookies.set('sdpb_closer', '', base)
  return res
}
