import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const password = String(body?.password || '').trim()
  const expected = String(process.env.APP_ADMIN_PASSWORD || '').trim()
  if (!expected || password !== expected) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set('sdpb_auth', expected, { httpOnly: true, sameSite: 'lax', secure: true, path: '/' })
  return res
}
