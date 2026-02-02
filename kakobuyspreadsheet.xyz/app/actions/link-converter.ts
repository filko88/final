"use server"
import "server-only"

export async function convertLink(link: string, agent?: string) {
  if (!link) {
    return { error: "Missing link parameter" }
  }

  try {
    const trimmed = link.trim()
    const base = "https://danodrevo-api.vercel.app"
    const normalized = trimmed.startsWith("http")
      ? trimmed
      : trimmed.startsWith("/")
        ? `${base}${trimmed}`
        : /^(taobao|weidian|1688)\/\d+$/i.test(trimmed)
          ? `${base}/${trimmed}`
          : trimmed

    const url = `${base}/convert?link=${encodeURIComponent(normalized)}`
    const res = await fetch(url, { cache: "no-store", headers: { Accept: "application/json" } })
    if (!res.ok) {
      return { error: `Request failed (${res.status})` }
    }
    const json = await res.json()
    return { data: json }
  } catch (err) {
    console.error("Link conversion error:", err)
    return { error: "Internal server error" }
  }
}
