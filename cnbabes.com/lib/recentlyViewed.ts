"use client"

const STORAGE_KEY = "CNBabes_recently_viewed"
const MAX_ITEMS = 25

export interface RecentlyViewedItem {
  _id: number
  name: string
  price: number
  image: string
  link: string
  marketplace: string
  type: "finds"
  viewedAt: number
}

export function addToRecentlyViewed(item: Omit<RecentlyViewedItem, "viewedAt">): void {
  if (typeof window === "undefined") return

  try {
    const existing = getRecentlyViewed()
    
    // Remove if already exists (to move to front)
    const filtered = existing.filter((i) => !(i._id === item._id && i.type === item.type))
    
    // Add to front with current timestamp
    const updated: RecentlyViewedItem[] = [
      { ...item, viewedAt: Date.now() },
      ...filtered,
    ].slice(0, MAX_ITEMS) // Keep only last 25
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch (error) {
    console.error("Failed to save recently viewed item:", error)
  }
}

export function getRecentlyViewed(): RecentlyViewedItem[] {
  if (typeof window === "undefined") return []

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    
    const items: RecentlyViewedItem[] = JSON.parse(stored)
    return Array.isArray(items) ? items : []
  } catch (error) {
    console.error("Failed to load recently viewed items:", error)
    return []
  }
}

export function clearRecentlyViewed(): void {
  if (typeof window === "undefined") return
  
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error("Failed to clear recently viewed items:", error)
  }
}



