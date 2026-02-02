import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type Agent =
  | "kakobuy"
  | "hipobuy"
  | "cnfans"
  | "acbuy"
  | "mulebuy"
  | "oopbuy"
  | "lovegobuy"
  | "itaobuy"
  | "cssbuy"
  | "usfans"
  | "superbuy"
  | "basetao"
  | "eastmallbuy"
  | "pingubuy"
  | "hoobuy"
  | "orientdig"
  | "ootdbuy"
  | "sugargoo"
  | "joyagoo"
  | "pantherbuy"
  | "ponybuy"
  | "bbdbuy"
  | "gonestbuy"
  | "loongbuy"
  | string

export interface RepFindsApiItem {
  id?: string | number
  _id?: number
  name?: string
  category?: string | null
  price?: number
  imageUrl?: string
  image?: string
  rawUrl?: string
  link?: string
  marketplace?: string
  agentLinks?: Record<string, string>
  brand?: string | null
  batch?: string | null
  view_count?: number
  viewCount?: number
  created_by?: string | null
  created_at?: string | null
  createdAt?: string | null
  updated_at?: string | null
  updatedAt?: string | null
  top?: boolean
  "category[0]"?: string | null
  "category[1]"?: string | null
  "category[2]"?: string | null
}

export interface NormalizedFind {
  _id: number
  name: string
  price: number
  image: string
  link: string
  rawUrl?: string
  marketplace?: string
  agentLinks?: Record<string, string>
  "category[0]": string | null
  "category[1]": string | null
  "category[2]": string | null
  brand: string
  batch?: string | null
  view_count: number
  created_by: string | null
  created_at: string | null
  updated_at: string | null
  top?: boolean
  boost_order?: number
  sort_order?: number
  status?: 'published' | 'draft'
}

// Helper to generate static items
const createItem = (
  id: number,
  name: string,
  cat0: string,
  cat1: string,
  price: number,
  image: string,
  brand: string = "Generic"
): NormalizedFind => ({
  _id: id,
  name,
  price,
  image,
  link: "https://example.com",
  agentLinks: {
    kakobuy: "https://kakobuy.com/register",
    cnfans: "https://cnfans.com/register",
  },
  "category[0]": cat0,
  "category[1]": cat1,
  "category[2]": null,
  brand,
  batch: "Good Batch",
  view_count: Math.floor(Math.random() * 5000) + 100,
  created_by: "System",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  top: false,
  boost_order: 0,
  sort_order: 0,
  status: 'published'
})

const STATIC_DB: NormalizedFind[] = [
  createItem(1, "Classic Leather Sneakers", "Shoes", "Sneaker", 45, "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=600", "Nike"),
]

import { supabase } from "@/lib/supabase"

export const safeFetchFinds = async (agent = "kakobuy", currency = "usd"): Promise<NormalizedFind[]> => {
  try {
    const { data, error } = await supabase
      .from('girls')
      .select('*')
      .eq('status', 'published') // Only fetch published items
      .order('boost_order', { ascending: false, nullsFirst: false })
      .order('sort_order', { ascending: true }) // Custom sort order; nulls behavior defaults usually sufficient
      .order('created_at', { ascending: false }) // Fallback by newness

    if (error) {
      console.error("Error fetching finds from Supabase:", error)
      return STATIC_DB
    }

    if (!data) return []

    // Map DB columns to NormalizedFind interface
    return data.map((item: any) => ({
      _id: item.id,
      name: item.name,
      price: Number(item.price),
      image: item.image,
      link: item.link,
      rawUrl: item.link,
      marketplace: item.marketplace,
      agentLinks: item.agent_links || {},
      "category[0]": item.category_0,
      "category[1]": item.category_1,
      "category[2]": item.category_2,
      brand: item.brand || "Generic",
      batch: item.batch,
      view_count: item.view_count || 0,
      created_by: item.temp_created_by || "System",
      created_at: item.created_at,
      updated_at: item.updated_at,
      top: item.top,
      boost_order: item.boost_order || 0,
      sort_order: item.sort_order || 0,
      status: item.status || 'published'
    }))
  } catch (err) {
    console.error("Unexpected error fetching finds:", err)
    return STATIC_DB
  }
}

export const fetchFindsFromDatabase = safeFetchFinds

export interface Category {
  id: number
  name: string
  parent_id: number | null
  sort_order: number
}

export const fetchCategories = async (): Promise<Category[]> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) {
      console.error("Error fetching categories:", error)
      return []
    }

    return data || []
  } catch (err) {
    console.error("Unexpected error fetching categories:", err)
    return []
  }
}
