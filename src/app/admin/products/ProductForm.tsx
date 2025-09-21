// src/app/admin/products/ProductForm.tsx
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

type CategoryRaw = { id: number; name: string; parent_id?: number | null }
type FlatCategory = { id: number; name: string; depth: number }

type Props = {
    productId?: number | null
    initial?: Partial<ProductFormValues & { imageUrl?: string }>
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
        imageFile: null
    })
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [categories, setCategories] = useState<FlatCategory[]>([])
    const fileRef = useRef<HTMLInputElement | null>(null)
    const router = useRouter()

    // ---- utilities: build tree & flatten with depth ----
    function buildCategoryTree(flat: CategoryRaw[]) {
        const map = new Map<number, any>()
        const roots: any[] = []

        flat.forEach((c) => map.set(c.id, { ...c, children: [] }))

        flat.forEach((c) => {
            const node = map.get(c.id)
            if (c.parent_id && map.has(c.parent_id)) {
                map.get(c.parent_id).children.push(node)
            } else {
                roots.push(node)
            }
        })

        return roots
    }

    function flattenWithDepth(nodes: any[], depth = 0, out: FlatCategory[] = []) {
        for (const n of nodes) {
            out.push({ id: n.id, name: n.name, depth })
            if (Array.isArray(n.children) && n.children.length) {
                flattenWithDepth(n.children, depth + 1, out)
            }
        }
        return out
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
                const body = await res.json().catch(() => null)
                if (!res.ok) throw new Error(body?.message || res.statusText)
                // api may return paginated {data:[]} or flat array
                const listRaw: CategoryRaw[] = Array.isArray(body) ? body : (body.data ?? [])

                if (!mounted) return
                // some APIs might already return a nested structure — try to detect
                // If items have 'children' property, assume nested tree already
                const looksNested = listRaw.length > 0 && (listRaw as any)[0].children != null

                const flatNormalized: CategoryRaw[] =
                    looksNested
                        ? // flatten nested to simple array (if necessary)
                        (function flattenNested(list: any[]): CategoryRaw[] {
                            const out: CategoryRaw[] = []
                            function walk(nodes: any[], parent: number | null = null) {
                                for (const n of nodes) {
                                    out.push({ id: Number(n.id), name: String(n.name), parent_id: parent ?? n.parent_id ?? null })
                                    if (Array.isArray(n.children) && n.children.length) walk(n.children, n.id)
                                }
                            }
                            walk(list)
                            return out
                        })(listRaw as any)
                        : // assume already flat with parent_id
                        (listRaw as CategoryRaw[])

                // Build tree and flatten with indentation depth
                const tree = buildCategoryTree(flatNormalized)
                const flatWithDepth = flattenWithDepth(tree)
                setCategories(flatWithDepth)
            } catch (e) {
                // non-fatal; keep categories empty and log
                // console.warn('Failed to load categories', e)
            }
        }
        loadCategories()
        return () => { mounted = false }
    }, [])

    useEffect(() => {
        // support initial.imageUrl (stored image url) as preview
        if (initial && (initial as any).imageUrl) setImagePreview((initial as any).imageUrl)
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
        reader.onload = () => setImagePreview(reader.result as string)
        reader.readAsDataURL(f)
    }

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

            const body = await res.json().catch(() => null)
            if (!res.ok) throw new Error(body?.message || res.statusText)

            router.push('/admin/products')
        } catch (err) {
            setError((err as Error).message)
        } finally {
            setLoading(false)
        }
    }

    // helper to detect data: previews
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
                    {/* <div className="text-xs text-gray-500 mt-1">Categories are loaded from the API </div> */}
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
