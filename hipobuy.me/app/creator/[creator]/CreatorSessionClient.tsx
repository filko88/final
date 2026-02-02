"use client"

import { useEffect } from "react"
import { setCreatorAffiliateSession } from "@/lib/creator-affiliates"

interface CreatorSessionClientProps {
  creatorName: string
  affiliateCodes: Record<string, string>
}

export default function CreatorSessionClient({
  creatorName,
  affiliateCodes,
}: CreatorSessionClientProps) {
  useEffect(() => {
    setCreatorAffiliateSession(creatorName || "", affiliateCodes || {})
    window.location.replace("/")
  }, [affiliateCodes, creatorName])

  return null
}
