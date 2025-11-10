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

export const ADMIN_TOKEN_KEY = 'ADMIN_TOKEN';

export function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setAdminToken(token: string | null) {
  if (typeof window === 'undefined') return;
  if (token === null) localStorage.removeItem(ADMIN_TOKEN_KEY);
  else localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function clearAdminToken() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}

/**
 * adminFetch: low-level helper that automatically injects Authorization header if token exists.
 * It returns the native Response so the caller can check status/res.headers and parse body themselves.
 */
export async function adminFetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
  const base = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/$/, '');
  const url =
    typeof input === 'string' && input.startsWith('/')
      ? `${base}${input}`
      : String(input);

  const token = getAdminToken();
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    ...(init && init.headers ? (init.headers as Record<string, string>) : {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const merged: RequestInit = {
    ...init,
    headers,
    credentials: 'same-origin',
  };

  return fetch(url, merged);
}

/**
 * adminFetchJson<T>: typed wrapper around adminFetch that:
 * - returns parsed JSON typed as T (or `undefined` on 204)
 * - throws Error with helpful message when response isn't ok
 * - keeps compatible behaviour for both array and { data: [...] } payloads (caller still types T)
 *
 * Use this for call-sites that want strongly-typed parsed payloads:
 *   const product = await adminFetchJson<Product>('/v1/admin/products/1')
 *
 * If you need the raw Response (status, headers), keep using adminFetch(...)
 */
export async function adminFetchJson<T = unknown>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await adminFetch(input, init);

  // 204 No Content
  if (res.status === 204) {
    return undefined as unknown as T;
  }

  // try to read text then parse JSON (safer than directly res.json())
  const text = await res.text().catch(() => '');
  let body: unknown = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      // not JSON — return text for callers who expect plain text (casted to T)
      body = text;
    }
  }

  if (!res.ok) {
    const msg =
      body && typeof body === 'object' && 'message' in (body as Record<string, unknown>)
        ? String((body as Record<string, unknown>)['message'])
        : res.statusText || `Request failed with status ${res.status}`;
    throw new Error(msg);
  }

  return body as T;
}

/**
 * verifyAdmin: optional helper that checks token validity.
 * Uses adminFetchJson so it's typed and easier to reason about.
 */
export async function verifyAdmin(): Promise<boolean> {
  const token = getAdminToken();
  if (!token) return false;
  try {
    const base = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/$/, '');
    // call the raw endpoint via adminFetch to preserve possibility of checking status if needed
    const res = await fetch(`${base}/v1/admin/me`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'same-origin',
    });
    if (!res.ok) return false;
    const data = await res.json().catch(() => null);
    return Boolean(data && data.is_admin);
  } catch {
    return false;
  }
}
