import { cookies } from 'next/headers'

const COOKIE_NAME = 'sdpb_auth'

export function isAuthed() {
  const pass = String(process.env.APP_ADMIN_PASSWORD || '').trim()
  const value = String(cookies().get(COOKIE_NAME)?.value || '').trim()
  return Boolean(pass && value && value === pass)
}

export function requireAuth() {
  if (!isAuthed()) {
    throw new Error('UNAUTHORIZED')
  }
}
