"use server"
import "server-only"

export type QcAlbum = {
  style: string | null
  image_url: string[]
  thumbnail: string
  createTime: string | null
}

export type PicksApiResponse = {
  product_id: string
  marketplace: string
  data: QcAlbum[]
  status: boolean
  processed: boolean
  qc_count: number
}

const QC_API_URL = process.env.PICKS_QC_API_URL

// New upstream response (normalized to PicksApiResponse below)
type PicksNewImage = {
  id: string
  url: string
  marketplace: string
  product_id: string
  created_at?: string
  width?: number
  height?: number
  qc_source?: string
  qc_group?: string
}

type PicksNewResponse = {
  success: boolean
  data: PicksNewImage[]
  total_images: number
  last_updated?: string
  retry?: boolean
}

// Grouped response from /qc/search/grouped
type PicksGroupedImage = {
  id: string
  url: string
  marketplace: string
  product_id: string
  created_at?: string
  width?: number
  height?: number
  qc_source?: string
  qc_group?: string
}

type PicksGroupedGroup = {
  qc_source?: string
  qc_group?: string
  group_name?: string
  images?: PicksGroupedImage[]
  total_images?: number
  latest_created_at?: string
}

type PicksGroupedResponse = {
  success: boolean
  groups?: PicksGroupedGroup[]
  total_groups?: number
  total_images?: number
  last_updated?: string
  retry?: boolean
}

function normalizeToOldShape(input: unknown): PicksApiResponse | null {
  // If input already matches the old shape, return as-is
  const maybeOld = input as Partial<PicksApiResponse>
  if (
    maybeOld &&
    typeof maybeOld === 'object' &&
    Array.isArray(maybeOld.data) &&
    (maybeOld.data.length === 0 || Array.isArray((maybeOld.data[0] as QcAlbum | undefined)?.image_url))
  ) {
    return maybeOld as PicksApiResponse
  }

  // Try to interpret as new response
  const maybeNew = input as Partial<PicksNewResponse>
  if (!maybeNew || typeof maybeNew !== 'object' || !Array.isArray(maybeNew.data)) {
    return null
  }

  const first = maybeNew.data[0]
  const imageUrls = maybeNew.data.map((i) => i.url).filter((u): u is string => typeof u === 'string' && u.length > 0)
  const qcCount = typeof maybeNew.total_images === 'number' ? maybeNew.total_images : imageUrls.length
  const processed = imageUrls.length > 0 && maybeNew.retry !== true

  const album: QcAlbum | null = imageUrls.length > 0
    ? {
        style: (first?.qc_group ?? null) as string | null,
        image_url: imageUrls,
        thumbnail: imageUrls[0] ?? '',
        createTime: (first?.created_at ?? maybeNew.last_updated ?? null) as string | null,
      }
    : null

  return {
    product_id: (first?.product_id ?? '') as string,
    marketplace: (first?.marketplace ?? '') as string,
    data: album ? [album] : [],
    status: Boolean(maybeNew.success),
    processed,
    qc_count: qcCount,
  }
}

function normalizeGrouped(input: unknown): PicksApiResponse | null {
  const maybe = input as Partial<PicksGroupedResponse>
  if (!maybe || typeof maybe !== 'object' || !Array.isArray(maybe.groups)) return null

  const albums: QcAlbum[] = []
  let firstImage: PicksGroupedImage | null = null
  let totalImages = 0

  for (const group of maybe.groups) {
    if (!group || typeof group !== 'object' || !Array.isArray(group.images)) continue
    const imageUrls = group.images.map((i) => i.url).filter((u): u is string => typeof u === 'string' && u.length > 0)
    if (imageUrls.length === 0) continue
    totalImages += imageUrls.length
    if (!firstImage) firstImage = group.images.find((i) => i && typeof i.url === 'string') || null
    albums.push({
      style: (group.group_name ?? group.qc_group ?? null) as string | null,
      image_url: imageUrls,
      thumbnail: imageUrls[0] ?? '',
      createTime: (group.latest_created_at ?? group.images[0]?.created_at ?? maybe.last_updated ?? null) as string | null,
    })
  }

  if (!firstImage) {
    return {
      product_id: '',
      marketplace: '',
      data: [],
      status: Boolean(maybe.success),
      processed: false,
      qc_count: 0,
    }
  }

  return {
    product_id: (firstImage.product_id ?? '') as string,
    marketplace: (firstImage.marketplace ?? '') as string,
    data: albums,
    status: Boolean(maybe.success),
    processed: totalImages > 0 && maybe.retry !== true,
    qc_count: typeof maybe.total_images === 'number' ? maybe.total_images : totalImages,
  }
}

export async function searchQc(rawUrl: string): Promise<PicksApiResponse | { error: string }> {
  if (!rawUrl || typeof rawUrl !== "string") {
    return { error: "Invalid URL" }
  }

  try {
    const apiUrl = `${QC_API_URL}?url=${encodeURIComponent(rawUrl.trim())}`
    const res = await fetch(apiUrl, { headers: { Accept: "application/json" }, cache: "no-store" })
    if (res.status === 404) {
      // Treat 404 as "no QC data yet" instead of hard error
      return {
        product_id: "",
        marketplace: "",
        data: [],
        status: false,
        processed: false,
        qc_count: 0,
      } satisfies PicksApiResponse
    }
    if (!res.ok) {
      return { error: `Upstream HTTP ${res.status}${res.statusText ? " " + res.statusText : ""}` }
    }
    const rawJson = await res.json()
    const normalized = normalizeGrouped(rawJson) ?? normalizeToOldShape(rawJson)
    return normalized ?? {
      product_id: "",
      marketplace: "",
      data: [],
      status: false,
      processed: false,
      qc_count: 0,
    }
  } catch {
    return { error: "Network error" }
  }
}


