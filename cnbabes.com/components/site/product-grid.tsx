import { ProductCollection } from "@/lib/types"
import { SectionHeader } from "@/components/site/section-header"
import { ProductCard } from "@/components/site/product-card"
import { ProductGridSkeleton } from "@/components/site/product-grid.skeleton"

type Props = {
  collections: ProductCollection[]
}

export function ProductGridSection({ collections }: Props) {
  if (!collections.length) {
    return <ProductGridSkeleton />
  }

  return (
    <div className="space-y-12">
      {collections.map((collection) => (
        <section key={collection.title} className="space-y-6">
          <SectionHeader
            eyebrow="Curated"
            title={collection.title}
            description="Handpicked drops and best-sellers refreshed regularly."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {collection.products.map((product) => (
              <ProductCard key={product.id} product={product} showBadge={false} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

