export type Product = {
  id: string
  name: string
  price?: number | null
  image?: string | null
  link?: string
  marketplace?: string
  type?: "finds" | string
  badge?: string | null
}

export type ProductCollection = {
  title: string
  href?: string
  products: Product[]
}

