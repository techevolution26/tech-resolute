// src/lib/adminApi.ts
export interface Paginated<T> {
  data: T[];
  meta?: {
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total?: number;
  };
}
export const ADMIN_TOKEN_KEY = 'ADMIN_TOKEN'

export function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(ADMIN_TOKEN_KEY)
}

export function setAdminToken(token: string | null) {
  if (typeof window === 'undefined') return
  if (token === null) {
    localStorage.removeItem(ADMIN_TOKEN_KEY)
  } else {
    localStorage.setItem(ADMIN_TOKEN_KEY, token)
  }
}

export function clearAdminToken() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(ADMIN_TOKEN_KEY)
}

/**
 * adminFetch: helper that automatically injects Authorization header if token exists.
 * It returns the native Response so the caller can parse json(), check status etc.
 */
export async function adminFetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
  const base = process.env.NEXT_PUBLIC_API_URL ?? ''
  const url = typeof input === 'string' && input.startsWith('/') ? `${base}${input}` : (input as string)
  const token = getAdminToken()
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    ...(init && init.headers ? (init.headers as Record<string, string>) : {}),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const merged: RequestInit = {
    ...init,
    headers,
    credentials: 'same-origin',
  }

  return fetch(url, merged)
}

/**
 * Optional small helper to verify admin token by calling protected endpoint.
 * Returns true if token exists and backend responds OK and indicates is_admin.
 */
export async function verifyAdmin(): Promise<boolean> {
  const token = getAdminToken()
  if (!token) return false
  try {
    const base = process.env.NEXT_PUBLIC_API_URL ?? ''
    const res = await fetch(`${base}/v1/admin/me`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'same-origin'
    })
    if (!res.ok) return false
    const data = await res.json().catch(() => null)
    return Boolean(data && data.is_admin)
  } catch {
    return false
  }
}
