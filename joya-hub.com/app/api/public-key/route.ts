import { NextResponse } from "next/server"
import { getActivePublicKey } from "@/app/lib/keyManager"
import { rateLimitByIp, rateLimitHeaders } from "@/app/lib/rateLimit"

export async function GET(request: Request) {
  const info = rateLimitByIp(request, "public-key", 60, 60_000)
  const headers = { ...rateLimitHeaders(info), "Cache-Control": "no-store, no-cache, must-revalidate" }
  if (!info.allowed) {
    return new NextResponse("Too Many Requests", { status: 429, headers })
  }
  const pub = getActivePublicKey()
  return NextResponse.json({ k: pub.s, i: pub.i }, { headers })
}


