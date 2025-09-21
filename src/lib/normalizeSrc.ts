/**
 * normalizeSrc helper for Next.js images.
 */

export function normalizeSrc(src?: string | null): string {
    if (!src) return '';

    const original = String(src).trim();
    if (!original) return '';

    // data URI -> pass through
    if (original.startsWith('data:')) return original;

    // If it's an absolute URL already, just normalize any /api/storage -> /storage
    if (/^https?:\/\//i.test(original) || /^\/\//.test(original)) {
        const abs = original.startsWith('//') ? 'http:' + original : original;
        return abs.replace(/\/api\/storage/gi, '/storage');
    }

    // If it's a relative path like "/storage/..." or "/api/storage/..."
    const relative = original.replace(/\/api\/storage/gi, '/storage');
    const path = relative.startsWith('/') ? relative : `/${relative}`;

    // Prefer explicit storage env; otherwise derive storage base from API env
    const storageEnv = (process.env.NEXT_PUBLIC_STORAGE_URL ?? '').replace(/\/+$/, '');
    let backend = storageEnv;
    if (!backend) {
        backend = (process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000').replace(/\/+$/, '');
        // striping a trailing '/api' if present (case-insensitive)
        backend = backend.replace(/\/api$/i, '');
    }

    return `${backend}${path}`;
}
