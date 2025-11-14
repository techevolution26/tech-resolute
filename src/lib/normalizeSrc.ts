/**
 * normalizeSrc helper for Next.js images.
 * - returns a safe absolute URL when possible
 * - accepts absolute URLs, protocol-relative URLs, or relative storage paths
 * - avoids double-prefixing hosts
 */
export function normalizeSrc(src?: string | null): string {
    if (!src) return ''

    let original = String(src).trim()
    if (!original) return ''

    // If the input accidentally contains two absolute URLs concatenated like:
    // "http://host1http://host2/...", keep last http... part.
    const idxFirst = original.indexOf('http')
    const idxLast = original.lastIndexOf('http')
    if (idxFirst !== -1 && idxLast > idxFirst) {
        original = original.slice(idxLast)
    }

    // data URI -> pass through
    if (original.startsWith('data:')) return original

    // protocol-relative -> make absolute with http:
    if (/^\/\//.test(original)) original = 'http:' + original

    // If it's already absolute, normalize /api/storage -> /storage and return,
    // but rewrite local hostnames to storageBase origin (so Vercel won't proxy localhost).
    if (/^https?:\/\//i.test(original)) {
        try {
            const parsed = new URL(original)
            // rewrite local dev hosts to configured storage base
            const localHosts = ['localhost', '127.0.0.1', '::1']
            if (localHosts.includes(parsed.hostname)) {
                const storageEnv = (process.env.NEXT_PUBLIC_STORAGE_URL ?? '').replace(/\/+$/, '')
                let backend = storageEnv
                if (!backend) {
                    backend = (process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000').replace(/\/+$/, '')
                    backend = backend.replace(/\/api$/i, '')
                }
                try {
                    const origin = new URL(backend).origin
                    return origin + parsed.pathname + parsed.search + parsed.hash
                } catch {
                    // fallthrough to returning the original (but at least normalized below)
                }
            }
        } catch {
            // ignore parse
        }
        return original.replace(/\/api\/storage/gi, '/storage')
    }

    // If it's a relative path (no protocol), normalize /api/storage -> /storage
    let relative = original.replace(/\/api\/storage/gi, '/storage')
    if (!relative.startsWith('/')) relative = '/' + relative

    // choose backend
    const storageEnv = (process.env.NEXT_PUBLIC_STORAGE_URL ?? '').replace(/\/+$/, '')
    let backend = storageEnv
    if (!backend) {
        backend = (process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000').replace(/\/+$/, '')
        backend = backend.replace(/\/api$/i, '')
    }

    const out = `${backend}${relative}`

    // final sanity: if out accidentally contains two host parts, keep last
    const firstHttp = out.indexOf('http')
    const lastHttp = out.lastIndexOf('http')
    if (firstHttp !== -1 && lastHttp > firstHttp) return out.slice(lastHttp)

    return out
}