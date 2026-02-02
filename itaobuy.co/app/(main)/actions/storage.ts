"use server"
import "server-only"
import { fetchFindsFromDatabase, type NormalizedFind } from "@/lib/finds-source"

type Agent = "kakobuy" | "cnfans" | "acbuy" | "oopbuy"
type Currency = "usd" | "eur" | "cny" | "gbp" | "pln" | "aud" | "cad" | "chf" | "czk"

async function fetchJson<T>(url: string): Promise<T | undefined> {
  try {
    const res = await fetch(url, { headers: { Accept: "application/json" } })
    if (!res.ok) return undefined
    const data = await res.json()
    return data as T
  } catch {
    return undefined
  }
}

export async function getFinds(agent: Agent, currency: Currency): Promise<NormalizedFind[] | undefined> {
  try {
    return await fetchFindsFromDatabase(agent, currency)
  } catch {
    return undefined
  }
}


