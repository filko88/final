"use client"

import { usePathname } from "next/navigation"
import type { PropsWithChildren } from "react"

export default function HideOnLinks({ children }: PropsWithChildren) {
	const pathname = usePathname()
	if (pathname && pathname.startsWith("/links")) return null
	return <>{children}</>
}
