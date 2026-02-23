import { cookies } from 'next/headers'

export type SessionUser = {
  username: string
  role: 'ADMIN' | 'CLOSER'
  closerId?: string
}

export function getSessionUser(): SessionUser | null {
  const store = cookies()
  const username = String(store.get('sdpb_user')?.value || '').trim()
  const role = String(store.get('sdpb_role')?.value || '').trim() as 'ADMIN' | 'CLOSER' | ''
  const closerId = String(store.get('sdpb_closer')?.value || '').trim()

  if (!username || (role !== 'ADMIN' && role !== 'CLOSER')) return null
  return { username, role, closerId: closerId || undefined }
}

export function isAuthed() {
  return Boolean(getSessionUser())
}

export function requireAuth() {
  const user = getSessionUser()
  if (!user) throw new Error('UNAUTHORIZED')
  return user
}

export function requireAdmin() {
  const user = requireAuth()
  if (user.role !== 'ADMIN') throw new Error('FORBIDDEN')
  return user
}
