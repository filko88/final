export interface CategorizableProduct {
  name?: string
  "category[0]"?: string | null
  "category[1]"?: string | null
  "category[2]"?: string | null
}

export interface CategoryFacet {
  key: string
  label: string
  count: number
}

const normalize = (value: string | null | undefined) => value?.toLowerCase().trim() ?? ""

// Get all unique categories from a product's category fields
export const getProductCategories = (product: CategorizableProduct): string[] => {
  const categories: string[] = []
  
  const cat0 = product["category[0]"]?.trim()
  const cat1 = product["category[1]"]?.trim()
  const cat2 = product["category[2]"]?.trim()
  
  if (cat0) categories.push(cat0)
  if (cat1) categories.push(cat1)
  if (cat2) categories.push(cat2)
  
  return categories
}

// Check if a product belongs to a category
export const productMatchesCategory = (product: CategorizableProduct, category: string): boolean => {
  const normalizedCategory = normalize(category)
  const cat0 = normalize(product["category[0]"])
  const cat1 = normalize(product["category[1]"])
  const cat2 = normalize(product["category[2]"])
  
  return cat0 === normalizedCategory || cat1 === normalizedCategory || cat2 === normalizedCategory
}

// Build category facets from actual database categories
export const buildCategoryFacets = (products: CategorizableProduct[]): CategoryFacet[] => {
  const categoryCounts = new Map<string, number>()
  
  // Count occurrences of each category
  for (const product of products) {
    const categories = getProductCategories(product)
    for (const category of categories) {
      const normalizedKey = normalize(category)
      if (normalizedKey) {
        categoryCounts.set(normalizedKey, (categoryCounts.get(normalizedKey) ?? 0) + 1)
      }
    }
  }
  
  // Convert to array and sort by count (descending)
  const facets: CategoryFacet[] = Array.from(categoryCounts.entries())
    .map(([key, count]) => {
      // Find the original category label (with proper casing) from the products
      const originalLabel = products
        .flatMap(p => getProductCategories(p))
        .find(cat => normalize(cat) === key) || key
      
      return {
        key,
        label: originalLabel,
        count,
      }
    })
    .sort((a, b) => b.count - a.count)
  
  return facets
}

