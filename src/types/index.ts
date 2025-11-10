// src/types/index.ts
export type Nullable<T> = T | null;

export interface Category {
    id: number;
    name: string;
    slug?: string;
    parent_id?: number | null;
    children?: Category[];
    // other dynamic fields from API; keep them as an object of unknowns
    extra?: Record<string, unknown>;
}

export interface ApiProduct {
    id: number | string;
    title: string;
    price?: number | string | null;
    category?: { id?: number; name?: string; slug?: string } | string | null;
    image?: string | null;
    image_url?: string | null;
    images?: string[]; // support multiple image URLs
    condition?: string | null;
    slug?: string;
    description?: string | null;
    // other dynamic fields
    extra?: Record<string, unknown>;
}

export interface Product {
    id: number | string;
    title: string;
    price?: string | number | null;
    category?: string;
    image?: string | null;
    images?: string[] | null;
    condition?: string | null;
    slug: string;
}

export interface OrderItem {
    id?: number;
    product_id?: number;
    title?: string | null;
    quantity?: number;
    unit_price?: number;
    total_price?: number;
    // other dynamic fields
    extra?: Record<string, unknown>;
}

export interface Order {
    id: number;
    status: string;
    total?: number | null;
    customer_name?: string | null;
    customer_email?: string | null;
    customer_phone?: string | null;
    shipping_address?: string | null;
    notes?: string | null;
    items?: OrderItem[];
    created_at?: string | null;
    product?: { title?: string; image?: string } | null;
    // other dynamic fields
    extra?: Record<string, unknown>;
}
