"use server"
import "server-only"

import { fetchFindsFromDatabase, type NormalizedFind } from "@/lib/finds-source"

export async function getItemById(id: string, agent = "kakobuy", currency = "usd") {
  const targetId = Number.parseInt(id, 10)
  if (!Number.isFinite(targetId)) {
    return { error: "Invalid item id" }
  }

  try {
    const items = await fetchFindsFromDatabase(agent, currency)
    const item = items.find((p) => p._id === targetId)
    if (!item) {
      return { error: "Item not found" }
    }
    return { item: item as NormalizedFind }
  } catch (error) {
    console.error("Item lookup error:", error)
    return { error: "Failed to load item" }
  }
}
