"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel"
import { Skeleton } from "@/components/ui/skeleton"
import { usePreferences } from "@/hooks/use-preferences"
import FindsCard from "@/components/FindsCard"

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

interface PopularItemsCarouselProps {
  products?: Product[]
}

export default function PopularItemsCarousel({ products }: PopularItemsCarouselProps) {
  const { selectedCurrency, selectedAgent, convertFromCny } = usePreferences()
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [api, setApi] = useState<CarouselApi>()
  const [isPaused, setIsPaused] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch products from local JSON in public folder
  const fetchLocalProducts = useCallback(async () => {
    try {
      setLoading(true)

      const response = await fetch(`/trending-carousel.json`, {
        headers: { 'Accept': 'application/json' },
        cache: 'no-cache',
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch local trending JSON: ${response.status}`)
      }

      const data = await response.json()
      const incoming: Product[] = Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data)
          ? data
          : []

      const popular = [...incoming]
        .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
        .slice(0, 10)

      setFeaturedProducts(popular)
    } catch {
      // Fallback to provided products if available
      if (products && products.length > 0) {
        const popular = [...products]
          .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
          .slice(0, 10)
        setFeaturedProducts(popular)
      } else {
        setFeaturedProducts([])
      }
    } finally {
      setLoading(false)
    }
  }, [products])

  // Load once from local JSON (fallback to provided products on error)
  useEffect(() => {
    fetchLocalProducts()
  }, [fetchLocalProducts])

  // Setup for carousel API when it becomes available
  useEffect(() => {
    if (!api) return
    
    return () => {
      // Clean up any existing listeners
    }
  }, [api])

  // Autoplay functionality - faster rotation
  useEffect(() => {
    // Don't set up autoplay if:
    // - Carousel API is not initialized yet
    // - Component is still loading
    // - There are no products or just one product (no need to rotate)
    if (!api || loading || featuredProducts.length <= 1) {
      return
    }
    
    // Start the autoplay when component mounts and api is ready
    const startAutoplay = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
             intervalRef.current = setInterval(() => {
         if (!isPaused && api) {
           api.scrollNext()
         }
       }, 1269) // Slower rotation - every 1.07 seconds (0.75x speed)
    }
    
    startAutoplay()
    
    // Clean up interval on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [api, loading, featuredProducts.length, isPaused])

  // Early return for loading state
  if (loading) {
    return (
      <div className="w-full flex justify-center">
        <div className="w-full max-w-6xl mx-auto">
          <Carousel className="w-full" opts={{ loop: true, align: "center" }}>
            <CarouselContent className="-ml-4 flex justify-center">
              {[1, 2, 3].map((_, index) => (
                <CarouselItem key={index} className="pl-4 basis-3/4 sm:basis-1/2 md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                  <div className="p-1">
                    <div className="group block h-full">
                      <div className="relative flex h-full flex-col overflow-hidden rounded-lg border border-foreground/10 bg-card p-2.5 shadow-sm">
                        <div className="relative flex h-full flex-col gap-2">
                          <div className="relative aspect-square overflow-hidden rounded-md border border-foreground/10 bg-foreground/5">
                            <Skeleton className="h-full w-full rounded-md bg-foreground/10" />
                          </div>
                          <div className="relative flex flex-1 flex-col gap-1">
                            <Skeleton className="h-5 w-5/6 bg-foreground/10" />
                            <Skeleton className="h-5 w-1/3 bg-foreground/10" />
                            <div className="mt-auto flex items-center gap-2 pt-1">
                              <Skeleton className="h-7 w-16 rounded-full bg-foreground/10" />
                              <Skeleton className="h-7 flex-1 rounded-full bg-foreground/10" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </div>
    )
  }

  // Early return for empty state
  if (featuredProducts.length === 0) {
    return (
      <div className="w-full text-center py-8">
        <p className="text-zinc-400 mb-4">No popular products available</p>
        <Link href="/finds">
          <Button variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10">
            Browse All Products
          </Button>
        </Link>
      </div>
    )
  }

  // Main render with actual products
  return (
    <div 
      className="w-full relative overflow-visible"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
      style={{
        maskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)'
      }}
    >
      {/* Left subtle blur overlay with darkening */}
      <div 
        className="absolute left-0 top-0 h-full w-[10%] z-10 pointer-events-none"
                  style={{
            backdropFilter: 'blur(3px)',
            WebkitBackdropFilter: 'blur(3px)',
            maskImage: 'linear-gradient(to right, black 0%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to right, black 0%, transparent 100%)'
          }}
      />
      
      {/* Right subtle blur overlay with darkening */}
      <div 
        className="absolute right-0 top-0 h-full w-[10%] z-10 pointer-events-none"
                  style={{
            backdropFilter: 'blur(1px)',
            WebkitBackdropFilter: 'blur(1px)',
            maskImage: 'linear-gradient(to left, black 0%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to left, black 0%, transparent 100%)'
          }}
      />
      
      <Carousel 
        className="w-full" 
        opts={{ loop: true, align: "center" }}
        setApi={setApi}
        key={`carousel-${featuredProducts.length}`}
      >
        <CarouselContent className="-ml-4">
          {featuredProducts.map((product) => (
            <CarouselItem 
              key={product._id} 
              className="pl-4 basis-3/4 sm:basis-1/2 md:basis-1/2 lg:basis-1/3 xl:basis-1/4 2xl:basis-1/5"
              role="group" 
              aria-roledescription="slide"
            >
              <div className="p-1">
                <FindsCard product={product} currency={selectedCurrency} selectedAgent={selectedAgent} convertFromCny={convertFromCny} />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  )
} 