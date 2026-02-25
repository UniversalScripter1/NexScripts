import { cookies } from 'next/headers'

const ADMIN_COOKIE = 'admin_session'

export function generateToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 64; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export function isAdminAuthenticated(): boolean {
  const cookieStore = cookies()
  const session = cookieStore.get(ADMIN_COOKIE)
  if (!session) return false
  
  // Simple validation - token must exist and match expected format
  const token = session.value
  return token.length === 64 && /^[A-Za-z0-9]+$/.test(token)
}

export function getAdminCookieName(): string {
  return ADMIN_COOKIE
}
