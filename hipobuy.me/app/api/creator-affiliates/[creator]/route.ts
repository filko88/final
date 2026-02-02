import { NextResponse, type NextRequest } from "next/server"
import { createAdminClient } from "@/utils/supabase/admin"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ creator: string }> }
) {
  const fallbackFromPath = () => {
    try {
      const pathname = new URL(request.url).pathname
      const parts = pathname.split("/").filter(Boolean)
      return parts[parts.length - 1] || ""
    } catch {
      return ""
    }
  }

  const { creator } = await params
  const rawCreator = creator || fallbackFromPath()
  const creatorName = decodeURIComponent(rawCreator || "").trim()
  if (!creatorName) {
    return NextResponse.json({ error: "Missing creator" }, { status: 400 })
  }

  try {
    const admin = await createAdminClient()
    let { data: creator } = await admin
      .from("creators")
      .select("name, affiliate_codes")
      .ilike("name", creatorName)
      .maybeSingle()

    if (!creator) {
      const { data: fallback } = await admin
        .from("creators")
        .select("name, affiliate_codes")
        .ilike("name", `%${creatorName}%`)
        .order("name", { ascending: true })
        .limit(1)
      creator = fallback?.[0] ?? null
    }

    if (!creator) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    return NextResponse.json({ name: creator.name, affiliate_codes: creator.affiliate_codes || {} })
  } catch (error) {
    console.error("creator-affiliates error", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
