"use client"

import { useEffect } from "react"
import clarity from "@microsoft/clarity"

type MicrosoftClarityProps = {
  projectId?: string
}

export default function MicrosoftClarity({ projectId }: MicrosoftClarityProps) {
  useEffect(() => {
    const id = projectId || process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID
    if (!id) return
    try {
      clarity.init(id)
    } catch {
      // no-op
    }
  }, [projectId])

  return null
}


