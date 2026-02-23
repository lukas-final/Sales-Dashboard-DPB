import { cookies } from 'next/headers'

const COOKIE_NAME = 'sdpb_auth'

export function isAuthed() {
  const pass = process.env.APP_ADMIN_PASSWORD
  const value = cookies().get(COOKIE_NAME)?.value
  return Boolean(pass && value && value === pass)
}

export function requireAuth() {
  if (!isAuthed()) {
    throw new Error('UNAUTHORIZED')
  }
}
