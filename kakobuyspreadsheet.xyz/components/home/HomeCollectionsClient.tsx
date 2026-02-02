"use client"

import { useEffect, useState } from "react"
import ProductCarousel from "@/components/ProductCarousel"
import { usePreferences } from "@/hooks/use-preferences"
import { getRecentlyViewed } from "@/lib/recentlyViewed"
import type { ProductCollection, Product } from "@/lib/types"

type CarouselProduct = {
  _id: string | number
  name: string
  price: number
  image: string
  link: string
  marketplace: string
  type?: "finds"
  "category[0]": string | null
  "category[1]": string | null
  "category[2]": string | null
  brand: string
  batch: string
  view_count: number
  created_by: string | null
  created_at: string | null
  updated_at: string | null
}

const mapProductToCarousel = (product: Product, index: number): CarouselProduct => ({
  _id: product.id ?? index,
  name: product.name,
  price: typeof product.price === "number" && !Number.isNaN(product.price) ? product.price : 0,
  image: product.image ?? "",
  link: product.link ?? "#",
  marketplace: product.marketplace ?? "Marketplace",
  type: "finds",
  "category[0]": null,
  "category[1]": null,
  "category[2]": null,
  brand: product.badge ?? "",
  batch: product.badge ?? "",
  view_count: 0,
  created_by: null,
  created_at: null,
  updated_at: null,
})

export function HomeCollectionsClient({ collections }: { collections: ProductCollection[] }) {
  const { selectedCurrency, selectedAgent, convertFromCny } = usePreferences()
  const [recentlyViewedItems, setRecentlyViewedItems] = useState<any[]>([])

  // Get recently viewed items from localStorage
  useEffect(() => {
    const recentlyViewed = getRecentlyViewed()
    setRecentlyViewedItems(recentlyViewed.slice(0, 15))
  }, [])

  if (!collections.length && !recentlyViewedItems.length) {
    return null
  }

  return (
    <div className="space-y-8">
      {/* Server-fetched collections from finds database */}
      {collections.map((collection) => (
        <ProductCarousel
          key={collection.title}
          title={collection.title}
          products={collection.products.map(mapProductToCarousel)}
          currency={selectedCurrency}
          selectedAgent={selectedAgent}
          convertFromCny={convertFromCny}
          viewAllHref="/finds"
          viewAllLabel="View more"
        />
      ))}
      
      {/* Recently Viewed (client-side from localStorage) */}
      {recentlyViewedItems.length > 0 && (
        <ProductCarousel
          title="Recently Viewed"
          products={recentlyViewedItems}
          currency={selectedCurrency}
          selectedAgent={selectedAgent}
          convertFromCny={convertFromCny}
          viewAllHref="/finds"
          viewAllLabel="View more"
        />
      )}
    </div>
  )
}


