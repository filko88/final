"use client"

import { usePathname } from "next/navigation"
import type { PropsWithChildren } from "react"

export default function HideOnAdmin({ children }: PropsWithChildren) {
    const pathname = usePathname()
    if (pathname && pathname.startsWith("/admin")) return null
    return <>{children}</>
}
