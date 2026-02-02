import { redirect } from "next/navigation"
import { createAdminClient } from "@/utils/supabase/admin"
import CreatorSessionClient from "./CreatorSessionClient"

export const dynamic = "force-dynamic"

export default async function CreatorSessionPage({ params }: { params: { creator: string } }) {
  const creatorName = decodeURIComponent(params.creator || "").trim()

  if (!creatorName) {
    redirect("/")
  }

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
    redirect("/")
  }

  const codes = creator.affiliate_codes || {}

  return (
    <CreatorSessionClient
      creatorName={creator.name}
      affiliateCodes={codes}
    />
  )
}
