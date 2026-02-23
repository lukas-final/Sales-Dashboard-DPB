import { NextResponse } from 'next/server'

export async function GET() {
  const expected = String(process.env.APP_ADMIN_PASSWORD || '')
  return NextResponse.json({ hasPassword: expected.length > 0, len: expected.length, startsWith: expected.slice(0,2) })
}
