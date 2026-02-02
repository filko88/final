"use server"
import "server-only"

import { headers } from "next/headers"
import { getActivePublicKey } from "@/app/lib/keyManager"
import { rateLimitByHeaders } from "@/app/lib/rateLimit"

export async function getHandshakeKey(): Promise<{ k: string; i: string } | { error: string }> {
  const info = rateLimitByHeaders(await headers(), "handshake", 20, 60_000)
  if (!info.allowed) {
    return { error: "Too Many Requests" }
  }

  const pub = getActivePublicKey()
  return { k: pub.s, i: pub.i }
}
