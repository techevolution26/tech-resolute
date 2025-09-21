export type Item = {
  title?: string
  condition?: string
  quantity?: number
  estimated_price?: string | number
  description?: string
  // single URL fields (legacy)
  image_url?: string | null
  image?: string | null
  // multi-image support
  image_urls?: string[] | null
}

export type Application = {
  id: number
  application_type?: 'business' | 'one_time'
  business_name?: string
  contact_name?: string
  email?: string
  phone?: string
  website?: string
  message?: string
  status?: string
  created_at?: string
  items?: Item[]
}
