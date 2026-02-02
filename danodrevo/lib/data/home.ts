import { Product, ProductCollection } from "@/lib/types"
import { safeFetchFinds, type NormalizedFind } from "@/lib/finds-source"

const mapFindToProduct = (find: NormalizedFind): Product => ({
  id: find._id.toString(),
  name: find.name,
  price: find.price,
  image: find.image || null,
  link: find.link,
  marketplace: find.marketplace || "Marketplace",
  type: "finds",
  badge: find.brand || find["category[0]"] || null,
})

export async function getHomeCollections(): Promise<ProductCollection[]> {
  try {
    // Fetch ONCE from finds database (same as /finds page)
    const allFinds = await safeFetchFinds()

    if (allFinds.length === 0) {
      return []
    }

    // Freshly Added - sorted by highest IDs (newest items)
    const freshlyAdded = allFinds
      .slice() // copy array
      .sort((a, b) => b._id - a._id)
      .slice(0, 15)
      .map(mapFindToProduct)

    // Most Viewed - sorted by view count
    const mostViewed = allFinds
      .slice() // copy array
      .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
      .slice(0, 15)
      .map(mapFindToProduct)

    // Category: Jackets
    const jackets = allFinds
      .filter((item) => {
        const cat0 = item["category[0]"]?.toLowerCase() || ""
        const cat1 = item["category[1]"]?.toLowerCase() || ""
        const cat2 = item["category[2]"]?.toLowerCase() || ""
        return cat0.includes("jacket") || cat1.includes("jacket") || cat2.includes("jacket")
      })
      .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
      .slice(0, 15)
      .map(mapFindToProduct)

    // Brand: Balenciaga
    const balenciaga = allFinds
      .filter((item) => {
        const brand = item.brand?.toLowerCase() || ""
        const name = item.name?.toLowerCase() || ""
        return brand.includes("balenciaga") || name.includes("balenciaga")
      })
      .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
      .slice(0, 15)
      .map(mapFindToProduct)

    const collections: ProductCollection[] = [
      { title: "Freshly Added", products: freshlyAdded },
      { title: "Most Viewed", products: mostViewed },
    ]

    // Only add category/brand collections if they have items
    if (jackets.length > 0) {
      collections.splice(1, 0, { title: "Jackets & Vests", products: jackets })
    }
    if (balenciaga.length > 0) {
      collections.splice(2, 0, { title: "Balenciaga", products: balenciaga })
    }

    return collections.filter((collection) => collection.products.length > 0)
  } catch (error) {
    console.error("Failed to load home collections:", error)
    return []
  }
}

