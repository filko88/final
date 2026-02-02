import { useEffect, useState } from "react"

const SESSION_CODES_KEY = "creator_affiliates"
const SESSION_NAME_KEY = "creator_name"
const SESSION_FETCHED_KEY = "creator_affiliates_fetched_at"
const SESSION_FOR_KEY = "creator_affiliates_for"
const EVENT_NAME = "creator-affiliates-changed"
const FETCH_TTL_MS = 5 * 60 * 1000

const inflightFetches = new Map<string, Promise<void>>()

export const getCreatorAffiliateMap = (): Record<string, string> | null => {
  if (typeof window === "undefined") return null
  const raw = sessionStorage.getItem(SESSION_CODES_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === "object") {
      return parsed as Record<string, string>
    }
  } catch {}
  return null
}

export const getCreatorAffiliateCode = (agent: string): string | null => {
  const map = getCreatorAffiliateMap()
  if (!map) return null
  const key = agent.toLowerCase()
  const code = map[key]
  if (typeof code !== "string") return null
  const trimmed = code.trim()
  return trimmed.length > 0 ? trimmed : null
}

export const setCreatorAffiliateSession = (
  creatorName: string,
  affiliateCodes: Record<string, string>
) => {
  if (typeof window === "undefined") return
  try {
    sessionStorage.setItem(SESSION_NAME_KEY, creatorName || "")
    sessionStorage.setItem(SESSION_CODES_KEY, JSON.stringify(affiliateCodes || {}))
    sessionStorage.setItem(SESSION_FETCHED_KEY, Date.now().toString())
    sessionStorage.setItem(SESSION_FOR_KEY, creatorName || "")
    window.dispatchEvent(new Event(EVENT_NAME))
  } catch {}
}

const readCreatorName = () => {
  if (typeof window === "undefined") return null
  const raw = sessionStorage.getItem(SESSION_NAME_KEY)
  if (raw && raw.trim()) return raw.trim()
  return null
}

const normalizeCode = (map: Record<string, string> | null, agent: string) => {
  if (!map) return null
  const code = map[agent.toLowerCase()]
  if (typeof code !== "string") return null
  const trimmed = code.trim()
  return trimmed.length > 0 ? trimmed : null
}

const shouldFetch = (creatorName: string) => {
  if (typeof window === "undefined") return true
  try {
    const storedFor = sessionStorage.getItem(SESSION_FOR_KEY) || ""
    const fetchedAt = Number(sessionStorage.getItem(SESSION_FETCHED_KEY) || "0")
    const isSameCreator = storedFor === creatorName
    const isFresh = Date.now() - fetchedAt < FETCH_TTL_MS
    if (isSameCreator && isFresh) return false
  } catch {}
  return true
}

export const useCreatorAffiliateCode = (agent: string): string | null => {
  const [code, setCode] = useState<string | null>(() => getCreatorAffiliateCode(agent))

  useEffect(() => {
    const refresh = () => {
      const creatorName = readCreatorName()
      if (!creatorName) {
        setCode(null)
        return
      }

      const cached = getCreatorAffiliateMap()
      setCode(normalizeCode(cached, agent))

      if (!shouldFetch(creatorName)) return

      const key = creatorName.toLowerCase()
      if (inflightFetches.has(key)) return

      const fetchPromise = (async () => {
        try {
          const res = await fetch(`/api/creator-affiliates/${encodeURIComponent(creatorName)}`, {
            cache: "no-store",
            headers: { Accept: "application/json" },
          })
          if (!res.ok) return
          const json = await res.json()
          if (!json || typeof json !== "object") return
          const next = json.affiliate_codes || {}
          sessionStorage.setItem(SESSION_CODES_KEY, JSON.stringify(next))
          sessionStorage.setItem(SESSION_FETCHED_KEY, Date.now().toString())
          sessionStorage.setItem(SESSION_FOR_KEY, creatorName)
          setCode(normalizeCode(next, agent))
        } catch {} finally {
          inflightFetches.delete(key)
        }
      })()

      inflightFetches.set(key, fetchPromise)
    }

    refresh()

    if (typeof window === "undefined") return
    const handler = () => refresh()
    window.addEventListener(EVENT_NAME, handler)
    return () => window.removeEventListener(EVENT_NAME, handler)
  }, [agent])

  return code
}
