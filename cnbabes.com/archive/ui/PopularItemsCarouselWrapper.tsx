"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowUpRight } from "lucide-react"
import { usePreferences } from "@/hooks/use-preferences"
import PopularItemsCarousel from "./PopularItemsCarousel"

interface Product {
  _id: number
  name: string
  price: number
  image: string
  link: string
  "category[0]": string | null
  "category[1]": string | null
  "category[2]": string | null
  brand: string
  batch?: string
  view_count: number
  created_by: string | null
  created_at: string | null
  updated_at: string | null
}

interface PopularItemsCarouselWrapperProps {
  fallbackProducts?: Product[]
}

export default function PopularItemsCarouselWrapper({ fallbackProducts }: PopularItemsCarouselWrapperProps) {
  const { selectedCurrency, selectedAgent } = usePreferences()

  return (
    <div className="mt-12 sm:mt-16 lg:mt-20 mb-8 sm:mb-12 lg:mb-16 w-full max-w-6xl mx-auto px-4 sm:px-6">
      <div className="text-center mb-4 sm:mb-6">
        <Link href={`/most-popular-finds?agent=${selectedAgent}&currency=${selectedCurrency}`}>
          <Button 
            variant="outline" 
            className="bg-white/5 border-white/20 text-white hover:bg-white/10 rounded-full px-4 sm:px-6 py-2 text-sm sm:text-base dark:bg-white/5 dark:border-white/20 dark:text-white dark:hover:bg-white/10"
          >
            View All Popular Items
            <ArrowUpRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
      
      <div className="relative">
        {/* Subtle glow effect behind carousel */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent rounded-2xl blur-xl dark:via-white/5" />
        <PopularItemsCarousel products={fallbackProducts} />
      </div>
    </div>
  )
}


