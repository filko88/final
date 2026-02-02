"use server"
import "server-only"

export interface TrackingEvent {
  id: string
  timestamp: string
  location: string
  status: string
  description: string
}

type PTKEvent = {
  time_iso?: string
  time_utc?: string
  time?: string
  time_stamp?: number | string
  location?: string
  stage?: string
  description?: string
}

type PTKProvider = { events?: PTKEvent[] }

type PTKData = {
  status?: string
  track_17?: { providers?: PTKProvider[] } | null
  track_docking?: PTKEvent[] | null
}

import { decryptWithKeyId } from "@/app/lib/keyManager"

export async function trackShipment(payload: { i: string; c: string }): Promise<
  { events: TrackingEvent[]; status: string; eta: string | null } | { error: string }
> {
  if (!payload || typeof payload.c !== 'string' || typeof payload.i !== 'string') {
    return { error: "Invalid tracking number" }
  }

  try {
    const tracksn = decryptWithKeyId(payload.i, payload.c)
    const apiUrl = `https://open.ptkcloud.com/tools/open/api/h5/international/logistics/track?tracksn=${encodeURIComponent(tracksn)}`
    const res = await fetch(apiUrl, { headers: { Accept: "application/json" }, cache: "no-store" })
    if (!res.ok) return { error: `Request failed: ${res.status}` }
    const json = await res.json()
    if (!json || json.code !== 200 || !json.data) return { error: "Invalid response" }

    const data = json.data as PTKData
    const providers = Array.isArray(data.track_17?.providers) ? data.track_17!.providers! : []
    const providerEvents: PTKEvent[] = providers.flatMap((p) => (Array.isArray(p.events) ? p.events! : []))
    const dockingEvents: PTKEvent[] = Array.isArray(data.track_docking) ? data.track_docking! : []

    const normalized: TrackingEvent[] = []

    providerEvents.forEach((e, index) => {
      const ts = e.time_iso || e.time_utc || e.time || null
      const when = ts ? new Date(ts).toLocaleString() : ""
      const uniqueId = `p-${index}-${e.time_stamp || e.time_iso || e.time || Date.now()}-${Math.random().toString(36).slice(2)}`
      normalized.push({
        id: uniqueId,
        timestamp: when,
        location: e.location || "",
        status: e.stage || data.status || "",
        description: e.description || "",
      })
    })

    dockingEvents.forEach((e, index) => {
      const ts = e.time || e.time_iso || e.time_utc || null
      const when = ts ? new Date(ts).toLocaleString() : ""
      const uniqueId = `d-${index}-${e.time_stamp || e.time || Date.now()}-${Math.random().toString(36).slice(2)}`
      normalized.push({
        id: uniqueId,
        timestamp: when,
        location: e.location || "",
        status: e.stage || data.status || "",
        description: e.description || "",
      })
    })

    normalized.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    const status = data.status || (normalized[0]?.status ?? "In Transit")
    const eta = status === "Delivered" ? "Delivered" : null

    return { events: normalized, status, eta }
  } catch {
    return { error: "Network error" }
  }
}


