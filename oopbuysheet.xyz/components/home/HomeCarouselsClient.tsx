"use client"

import { useEffect, useState } from "react"
import ProductCarousel from "@/components/ProductCarousel"
import { usePreferences } from "@/hooks/use-preferences"
import { getRecentlyViewed, type RecentlyViewedItem } from "@/lib/recentlyViewed"
import type { HomeData } from "@/lib/home-data"

type HomeProduct = HomeData[keyof HomeData][number]

type CarouselProduct = {
  _id: string | number
  name: string
  price: number
  image: string
  link: string
  marketplace: string
  type?: "finds"
  "category[0]"?: string | null
  "category[1]"?: string | null
  "category[2]"?: string | null
  brand?: string
  batch?: string
  view_count?: number
  created_by?: string | null
  created_at?: string | null
  updated_at?: string | null
}

interface HomeCarouselsClientProps {
  data: HomeData
}

export default function HomeCarouselsClient({ data }: HomeCarouselsClientProps) {
  const { selectedAgent, selectedCurrency, convertFromCny } = usePreferences()
  const [recentlyViewedItems, setRecentlyViewedItems] = useState<RecentlyViewedItem[]>([])

  useEffect(() => {
    const recentlyViewed = getRecentlyViewed()
    setRecentlyViewedItems(recentlyViewed.slice(0, 15))
  }, [])

  const normalizeForCarousel = (item: HomeProduct | RecentlyViewedItem): CarouselProduct => {
    const batch = "batch" in item ? item.batch : undefined
    return {
      ...item,
      batch: batch ?? undefined,
      marketplace: item.marketplace ?? "unknown",
    }
  }

  const renderSection = (title: string, items: Array<HomeProduct | RecentlyViewedItem>) => {
    if (!items.length) return null
    const carouselItems = items.map(normalizeForCarousel)
    return (
      <ProductCarousel
        title={title}
        products={carouselItems}
        currency={selectedCurrency}
        selectedAgent={selectedAgent}
        convertFromCny={convertFromCny}
        viewAllHref="/finds"
        viewAllLabel="View more"
      />
    )
  }

  return (
    <>
      {renderSection("Trending Now", data.trendingItems)}
      {renderSection("Most Popular", data.mostViewedItems)}
      {renderSection("Newest", data.recentlyAddedItems)}
      {renderSection("Fashion Pioneers", data.fashionPioneersItems)}
      {renderSection("The North Face", data.catTnfItems)}
      {renderSection("Dior", data.catDiorItems)}
      {renderSection("Glasses", data.catGlassesItems)}
      {renderSection("Sweatshirts", data.catSweatshirtsItems)}
      {renderSection("T-Shirts", data.catTshirtsItems)}
      {renderSection("Home Decor", data.catDecorItems)}
      {renderSection("Jewelry", data.catJewelryItems)}
      {renderSection("Winter Wear", data.catWinterItems)}
      {renderSection("Accessories", data.catAccessoriesItems)}
      {renderSection("Bags", data.catBagsItems)}
      {renderSection("Bottoms", data.catBottomsItems)}
      {recentlyViewedItems.length > 0 && renderSection("Recently Viewed", recentlyViewedItems)}
    </>
  )
}
