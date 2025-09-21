// src/app/admin/categories/types.ts
export type Category = {
  id: number
  name: string
  slug?: string | null
  parent_id?: number | null
  children?: Category[]
}
