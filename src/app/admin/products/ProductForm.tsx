'use client'
import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { adminFetch, clearAdminToken } from '@/lib/adminApi'
import Image from 'next/image'

export type ProductFormValues = {
    title: string
    slug?: string
    description?: string
    price: string
    currency?: string
    condition?: string
    category_id?: string
    stock?: string
    imageFile?: File | null
}

type CategoryRaw = { id: number; name: string; parent_id?: number | null; children?: unknown }
type FlatCategory = { id: number; name: string; depth: number }
type InitialWithImage = Partial<ProductFormValues> & { imageUrl?: string | null }


type Props = {
    productId?: number | null
    initial?: Partial<ProductFormValues & { imageUrl?: string }>
}

type CategoryNode = {
    id: number
    name: string
    parent_id?: number | null
    children: CategoryNode[]
}

export default function ProductForm({ productId = null, initial = {} }: Props) {
    const [values, setValues] = useState<ProductFormValues>({
        title: initial.title ?? '',
        slug: initial.slug ?? '',
        description: initial.description ?? '',
        price: initial.price ?? '',
        currency: initial.currency ?? 'KES',
        condition: initial.condition ?? 'New',
        category_id: initial.category_id ?? '',
        stock: initial.stock ?? '0',
        imageFile: null,
    })
    const [imagePreview, setImagePreview] = useState<string | null>(initial.imageUrl ?? null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [categories, setCategories] = useState<FlatCategory[]>([])
    const fileRef = useRef<HTMLInputElement | null>(null)
    const router = useRouter()

    // ---- utilities: build tree & flatten with depth ----
    function buildCategoryTree(flat: CategoryRaw[]): CategoryNode[] {
        const map = new Map<number, CategoryNode>()
        const roots: CategoryNode[] = []

        for (const c of flat) {
            map.set(c.id, { id: c.id, name: c.name, parent_id: c.parent_id ?? null, children: [] })
        }

        for (const c of flat) {
            const node = map.get(c.id)!
            const parentId = c.parent_id ?? null
            if (parentId !== null && map.has(parentId)) {
                map.get(parentId)!.children.push(node)
            } else {
                roots.push(node)
            }
        }

        return roots
    }

    function flattenWithDepth(nodes: CategoryNode[], depth = 0, out: FlatCategory[] = []) {
        for (const n of nodes) {
            out.push({ id: n.id, name: n.name, depth })
            if (n.children && n.children.length) {
                flattenWithDepth(n.children, depth + 1, out)
            }
        }
        return out
    }

    // runtime guard: does this object look like nested nodes (has children)?
    function looksNestedCandidate(x: unknown): x is { children?: unknown } {
        return typeof x === 'object' && x !== null && ('children' in x)
    }

    // ---- loading categories and transform to flattened list with depth ----
    useEffect(() => {
        let mounted = true
        async function loadCategories() {
            try {
                const res = await adminFetch('/v1/admin/categories')
                if (res.status === 401 || res.status === 403) {
                    clearAdminToken()
                    window.location.href = '/admin/login'
                    return
                }

                const body = (await res.json().catch(() => null)) as unknown
                if (!res.ok) {
                    const msg =
                        typeof body === 'object' && body !== null && 'message' in (body as Record<string, unknown>)
                            ? String((body as Record<string, unknown>)['message'])
                            : res.statusText
                    throw new Error(msg)
                }

                // body might be array or { data: [...] }
                const rawList =
                    Array.isArray(body) ? body : (typeof body === 'object' && body !== null && Array.isArray((body as Record<string, unknown>)['data'])
                        ? (body as Record<string, unknown>)['data']
                        : [])

                // if first item has 'children' property, treat as nested and flatten it
                let flatNormalized: CategoryRaw[] = []

                if (Array.isArray(rawList) && rawList.length > 0 && looksNestedCandidate(rawList[0])) {
                    // flatten nested to simple array
                    const flattenNested = (list: unknown[]): CategoryRaw[] => {
                        const out: CategoryRaw[] = []
                        function walk(nodes: unknown[], parent: number | null = null) {
                            for (const n of nodes) {
                                if (typeof n === 'object' && n !== null) {
                                    const rec = n as Record<string, unknown>
                                    const id = rec['id'] != null ? Number(rec['id']) : NaN
                                    const name = rec['name'] != null ? String(rec['name']) : ''
                                    out.push({ id, name, parent_id: parent ?? (rec['parent_id'] as number | null | undefined) ?? null })
                                    if (Array.isArray(rec['children']) && rec['children'].length) {
                                        walk(rec['children'] as unknown[], id)
                                    }
                                }
                            }
                        }
                        walk(list)
                        return out
                    }
                    flatNormalized = flattenNested(rawList)
                } else if (Array.isArray(rawList)) {
                    // assume already flat records
                    flatNormalized = rawList
                        .map((it) => {
                            if (typeof it === 'object' && it !== null) {
                                const r = it as Record<string, unknown>
                                return {
                                    id: Number(r['id']),
                                    name: String(r['name'] ?? ''),
                                    parent_id: r['parent_id'] == null ? null : Number(r['parent_id']),
                                } as CategoryRaw
                            }
                            // fallback empty
                            return { id: 0, name: '', parent_id: null } as CategoryRaw
                        })
                        .filter(c => !Number.isNaN(c.id))
                }

                if (!mounted) return
                const tree = buildCategoryTree(flatNormalized)
                const flatWithDepth = flattenWithDepth(tree)
                setCategories(flatWithDepth)
            } catch (err: unknown) {
                // non-fatal; keep categories empty and log to console for dev
                // eslint-disable-next-line no-console
                console.warn('Failed to load categories', err)
            }
        }
        loadCategories()
        return () => { mounted = false }
    }, [])

    useEffect(() => {
        if (!initial) return

        const init = initial as InitialWithImage
        if (typeof init.imageUrl === 'string' && init.imageUrl) {
            setImagePreview(init.imageUrl)
        }
    }, [initial])

    function onChangeField<K extends keyof ProductFormValues>(field: K, v: ProductFormValues[K]) {
        setValues(prev => ({ ...prev, [field]: v }))
    }

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const f = e.target.files?.[0] ?? null
        onChangeField('imageFile', f)
        if (!f) {
            setImagePreview(null)
            return
        }
        const reader = new FileReader()
        reader.onload = () => setImagePreview(String(reader.result ?? ''))
        reader.readAsDataURL(f)
    }

    // === FIXED submit with correct try/catch/finally and msg scoping ===
    async function submit(e?: React.FormEvent) {
        e?.preventDefault()
        setError(null)
        setLoading(true)

        try {
            const form = new FormData()
            form.append('title', values.title)
            form.append('slug', values.slug ?? '')
            form.append('description', values.description ?? '')
            form.append('price', values.price)
            form.append('currency', values.currency ?? 'KES')
            form.append('condition', values.condition ?? 'New')
            if (values.category_id) form.append('category_id', values.category_id)
            if (values.stock) form.append('stock', values.stock)
            if (values.imageFile) form.append('image', values.imageFile)

            const endpoint = productId ? `/v1/admin/products/${productId}` : '/v1/admin/products'
            const method = 'POST'
            if (productId) form.append('_method', 'PUT')

            const res = await adminFetch(endpoint, {
                method,
                body: form,
            })

            if (res.status === 401 || res.status === 403) {
                clearAdminToken()
                window.location.href = '/admin/login'
                return
            }

            const body = (await res.json().catch(() => null)) as unknown
            if (!res.ok) {
                const msg =
                    typeof body === 'object' && body !== null && 'message' in (body as Record<string, unknown>)
                        ? String((body as Record<string, unknown>)['message'])
                        : res.statusText
                throw new Error(msg)
            }

            // success -> navigate to products list
            router.push('/admin/products')
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : String(err))
        } finally {
            setLoading(false)
        }
    }

    const isDataUri = (src?: string | null) => !!src && src.startsWith('data:')

    return (
        <form onSubmit={submit} className="space-y-4 bg-white p-6 rounded-2xl shadow-sm">
            <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input value={values.title} onChange={e => onChangeField('title', e.target.value)} required className="mt-1 w-full p-2 border rounded" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Price</label>
                    <input value={values.price} onChange={e => onChangeField('price', e.target.value)} required className="mt-1 w-full p-2 border rounded" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Condition</label>
                    <select value={values.condition} onChange={e => onChangeField('condition', e.target.value)} className="mt-1 w-full p-2 border rounded">
                        <option>New</option>
                        <option>Refurbished</option>
                        <option>Digital</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <select
                        value={values.category_id ?? ''}
                        onChange={e => onChangeField('category_id', e.target.value)}
                        className="mt-1 w-full p-2 border rounded"
                    >
                        <option value="">— Select category —</option>
                        {categories.map(c => (
                            <option key={c.id} value={String(c.id)}>
                                {Array(c.depth).fill('\u00A0\u00A0').join('')}{c.depth > 0 ? '↳ ' : ''}{c.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Stock</label>
                    <input value={values.stock} onChange={e => onChangeField('stock', e.target.value)} className="mt-1 w-full p-2 border rounded" />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea value={values.description} onChange={e => onChangeField('description', e.target.value)} className="mt-1 w-full p-2 border rounded" rows={4} />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Image</label>
                <div className="flex items-center gap-4 mt-2">
                    <div className="w-32 h-20 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                        {imagePreview ? (
                            isDataUri(imagePreview) ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={imagePreview} alt="preview" className="object-cover w-full h-full" />
                            ) : (
                                <Image src={imagePreview} alt="preview" width={320} height={180} className="object-cover w-full h-full" />
                            )
                        ) : (
                            <div className="text-xs text-gray-400">No image</div>
                        )}
                    </div>

                    <div>
                        <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} />
                        <div className="text-xs text-gray-500 mt-1">Max 2MB. Local preview available.</div>
                    </div>
                </div>
            </div>

            {error && <div className="text-red-600">{error}</div>}

            <div className="flex justify-end gap-3">
                <button type="button" onClick={() => window.history.back()} className="px-4 py-2 rounded bg-gray-100">Cancel</button>
                <button type="submit" disabled={loading} className="px-4 py-2 rounded bg-indigo-600 text-white">
                    {loading ? 'Saving…' : (productId ? 'Update product' : 'Create product')}
                </button>
            </div>
        </form>
    )
}
