"use server"
import "server-only"

export type QcGroupedImage = {
  id: string
  url: string
  marketplace?: string
  product_id?: string
  created_at?: string
  width?: number
  height?: number
  qc_source?: string
  qc_group?: string
}

export type QcGroupedGroup = {
  qc_source?: string
  qc_group?: string
  group_name?: string
  images: QcGroupedImage[]
  total_images?: number
  latest_created_at?: string
}

export type QcGroupedResult = {
  success: boolean
  groups: QcGroupedGroup[]
  total_groups?: number
  total_images?: number
  last_updated?: string
  retry?: boolean
}

const QC_API_URL = process.env.PICKS_QC_API_URL

type PicksGroupedResponse = {
  success?: boolean
  groups?: Array<{
    qc_source?: string
    qc_group?: string
    group_name?: string
    images?: QcGroupedImage[]
    total_images?: number
    latest_created_at?: string
  }>
  total_groups?: number
  total_images?: number
  last_updated?: string
  retry?: boolean
}

export async function fetchQcGrouped(rawUrl: string): Promise<QcGroupedResult | { error: string }> {
  if (!rawUrl || typeof rawUrl !== "string") {
    return { error: "Invalid URL" }
  }

  try {
    const url = rawUrl.trim()
    const apiUrl = `${QC_API_URL}?url=${encodeURIComponent(url)}`
    const res = await fetch(apiUrl, { headers: { Accept: "application/json" }, cache: "no-store" })

    if (res.status === 404) {
      return { success: false, groups: [], total_groups: 0, total_images: 0 }
    }
    if (!res.ok) {
      return { error: `Upstream HTTP ${res.status}${res.statusText ? " " + res.statusText : ""}` }
    }

    const raw = (await res.json().catch(() => null)) as PicksGroupedResponse | null
    if (!raw || typeof raw !== "object") {
      return { error: "Invalid response" }
    }

    const groups = Array.isArray(raw.groups) ? raw.groups : []
    const normalizedGroups: QcGroupedGroup[] = groups
      .map((group) => {
        const images = Array.isArray(group.images)
          ? group.images.filter((img) => img && typeof img.url === "string" && img.url.length > 0)
          : []
        return {
          qc_source: group.qc_source,
          qc_group: group.qc_group,
          group_name: group.group_name,
          images,
          total_images: group.total_images,
          latest_created_at: group.latest_created_at,
        }
      })
      .filter((group) => group.images.length > 0)

    return {
      success: Boolean(raw.success),
      groups: normalizedGroups,
      total_groups: raw.total_groups,
      total_images: raw.total_images,
      last_updated: raw.last_updated,
      retry: raw.retry,
    }
  } catch {
    return { error: "Network error" }
  }
}
