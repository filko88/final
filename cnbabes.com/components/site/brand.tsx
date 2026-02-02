"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"

type BrandProps = {
  className?: string
  showTagline?: boolean
}

const SITE_NAME = "CNBabes"
const SITE_TAGLINE =
  "Discover the best rep spreadsheet for Kakobuy, Cnfans, Acbuy, Oopbuy and other agents."

export function BrandMark({ className, showTagline = false }: BrandProps) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-2", className)}>
      <span className="flex flex-col">
        <span className="text-base font-semibold leading-tight tracking-tight text-foreground">
          {SITE_NAME}
        </span>
        {showTagline && (
          <span className="text-xs text-muted-foreground">
            {SITE_TAGLINE}
          </span>
        )}
      </span>
    </Link>
  )
}

