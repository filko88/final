import { fetchFindsFromDatabase, type NormalizedFind } from "@/lib/finds-source"

export type HomeData = {
  trendingItems: NormalizedFind[]
  mostViewedItems: NormalizedFind[]
  recentlyAddedItems: NormalizedFind[]
  fashionPioneersItems: NormalizedFind[]
  catTnfItems: NormalizedFind[]
  catDiorItems: NormalizedFind[]
  catGlassesItems: NormalizedFind[]
  catSweatshirtsItems: NormalizedFind[]
  catTshirtsItems: NormalizedFind[]
  catDecorItems: NormalizedFind[]
  catJewelryItems: NormalizedFind[]
  catWinterItems: NormalizedFind[]
  catAccessoriesItems: NormalizedFind[]
  catBagsItems: NormalizedFind[]
  catBottomsItems: NormalizedFind[]
}

const DEFAULT_LIMIT = 15

const withFindsType = (items: NormalizedFind[]) =>
  items.map((item) => ({ ...item, type: "finds" }))

const byViewCount = (items: NormalizedFind[]) =>
  [...items].sort((a, b) => (b.view_count || 0) - (a.view_count || 0))

const byNewest = (items: NormalizedFind[]) =>
  [...items].sort((a, b) => b._id - a._id)

const filterByCategory = (items: NormalizedFind[], category: string) => {
  const target = category.toLowerCase()
  return items.filter((item) => {
    const cat0 = item["category[0]"]?.toLowerCase() || ""
    const cat1 = item["category[1]"]?.toLowerCase() || ""
    const cat2 = item["category[2]"]?.toLowerCase() || ""
    return cat0.includes(target) || cat1.includes(target) || cat2.includes(target)
  })
}

const filterByBrand = (items: NormalizedFind[], brand: string) => {
  const target = brand.toLowerCase()
  return items.filter((item) => {
    const brandField = item.brand?.toLowerCase() || ""
    const nameField = item.name?.toLowerCase() || ""
    return brandField.includes(target) || nameField.includes(target)
  })
}

export async function getHomeData(): Promise<HomeData> {
  const findsItems = await fetchFindsFromDatabase("kakobuy", "usd").catch(() => [] as NormalizedFind[])
  const allItems = withFindsType(findsItems)

  if (allItems.length === 0) {
    return {
      trendingItems: [],
      mostViewedItems: [],
      recentlyAddedItems: [],
      fashionPioneersItems: [],
      catTnfItems: [],
      catDiorItems: [],
      catGlassesItems: [],
      catSweatshirtsItems: [],
      catTshirtsItems: [],
      catDecorItems: [],
      catJewelryItems: [],
      catWinterItems: [],
      catAccessoriesItems: [],
      catBagsItems: [],
      catBottomsItems: [],
    }
  }

  const popularSorted = byViewCount(allItems)

  return {
    trendingItems: popularSorted.slice(0, 8),
    mostViewedItems: popularSorted.slice(0, DEFAULT_LIMIT),
    recentlyAddedItems: byNewest(allItems).slice(0, DEFAULT_LIMIT),
    fashionPioneersItems: byViewCount(filterByCategory(allItems, "jacket")).slice(0, DEFAULT_LIMIT),
    catTnfItems: byViewCount(filterByBrand(allItems, "the north face")).slice(0, DEFAULT_LIMIT),
    catDiorItems: byViewCount(filterByBrand(allItems, "dior")).slice(0, DEFAULT_LIMIT),
    catGlassesItems: byViewCount(filterByCategory(allItems, "glasses")).slice(0, DEFAULT_LIMIT),
    catSweatshirtsItems: byViewCount(filterByCategory(allItems, "sweatshirt")).slice(0, DEFAULT_LIMIT),
    catTshirtsItems: byViewCount(filterByCategory(allItems, "t-shirt")).slice(0, DEFAULT_LIMIT),
    catDecorItems: byViewCount(filterByCategory(allItems, "decor")).slice(0, DEFAULT_LIMIT),
    catJewelryItems: byViewCount(filterByCategory(allItems, "jewelry")).slice(0, DEFAULT_LIMIT),
    catWinterItems: byViewCount(filterByCategory(allItems, "coat")).slice(0, DEFAULT_LIMIT),
    catAccessoriesItems: byViewCount(filterByCategory(allItems, "accessory")).slice(0, DEFAULT_LIMIT),
    catBagsItems: byViewCount(filterByCategory(allItems, "bag")).slice(0, DEFAULT_LIMIT),
    catBottomsItems: byViewCount(filterByCategory(allItems, "pants")).slice(0, DEFAULT_LIMIT),
  }
}
