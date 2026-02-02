"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { getItemById } from "@/app/actions/item"

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
  batch?: string | null
  view_count: number
  created_by: string | null
  created_at: string | null
  updated_at: string | null
}

interface ItemDetailsClientProps {
  marketplace: string
  id: string
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
})

export default function ItemDetailsClient({ marketplace, id }: ItemDetailsClientProps) {
  const [item, setItem] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const result = await getItemById(id)
        if ("error" in result) throw new Error(result.error)
        setItem(result.item)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load item")
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [id])

  const categories = [item?.["category[0]"], item?.["category[1]"], item?.["category[2]"]].filter(Boolean) as string[]

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-accent/80">Finds · {marketplace}</p>
        <h1 className="text-3xl sm:text-4xl font-semibold text-foreground">Item details</h1>
        <p className="text-sm text-muted-foreground">Dark, lime-accent detail view with clean call-to-action.</p>
      </div>

      {isLoading && (
        <div className="rounded-2xl border border-foreground/10 bg-foreground/5 p-6 animate-pulse">
          <div className="h-6 w-40 bg-white/10 rounded mb-3" />
          <div className="h-10 w-72 bg-white/10 rounded mb-6" />
          <div className="h-64 w-full bg-white/5 rounded" />
        </div>
      )}

      {!isLoading && error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-red-100">
          {error}
        </div>
      )}

      {!isLoading && item && (
        <div className="grid gap-6 lg:grid-cols-2 items-start">
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-foreground/10 bg-foreground/5">
            <Image
              src={item.image || "/images/repsheet-app.png"}
              alt={item.name || "Product"}
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 50vw, 100vw"
              priority
            />
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                {item.batch && <Badge variant="outline" className="border-accent/30 text-accent">{item.batch}</Badge>}
                {categories.map((cat) => (
                  <Badge key={cat} variant="outline" className="border-white/10 text-white/80">
                    {cat}
                  </Badge>
                ))}
              </div>
              <h2 className="text-2xl font-semibold text-foreground">{item.name}</h2>
              <p className="text-lg text-accent">{currencyFormatter.format(item.price)}</p>
            </div>

            <div className="grid gap-3 rounded-2xl border border-foreground/10 bg-foreground/5 p-4">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Brand</span>
                <span className="text-foreground font-medium">{item.brand || "Unknown"}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Views</span>
                <span className="text-foreground font-medium">{item.view_count?.toLocaleString() ?? "–"}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>ID</span>
                <span className="text-foreground font-medium">{item._id}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <a href={item.link} target="_blank" rel="noreferrer">
                  Open listing
                </a>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/finds">Back to finds</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
