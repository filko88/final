"use server"
import "server-only"

const MAX_IMAGE_BYTES = 8 * 1024 * 1024

export async function fetchRemoteImage(url: string) {
  if (!url) {
    return { error: "Missing URL" }
  }

  try {
    const res = await fetch(url, { headers: { Accept: "image/*" }, cache: "no-store" })
    if (!res.ok) {
      return { error: `Failed to fetch image (${res.status})` }
    }

    const contentLength = Number(res.headers.get("content-length") || "0")
    if (contentLength && contentLength > MAX_IMAGE_BYTES) {
      return { error: "Image too large" }
    }

    const arrayBuffer = await res.arrayBuffer()
    if (arrayBuffer.byteLength > MAX_IMAGE_BYTES) {
      return { error: "Image too large" }
    }

    const contentType = res.headers.get("content-type") || "application/octet-stream"
    const base64 = Buffer.from(arrayBuffer).toString("base64")
    return { base64, contentType }
  } catch (error) {
    console.error("Remote image fetch error:", error)
    return { error: "Failed to fetch image" }
  }
}
