"use client"

import { usePathname } from "next/navigation"
import type { PropsWithChildren } from "react"

export default function MainContainer({ children }: PropsWithChildren) {
    const pathname = usePathname()
    const isAdmin = pathname?.startsWith("/admin")

    return (
        <main className={`flex-1 w-full overflow-x-hidden ${isAdmin ? "" : "pt-12"}`}>
            {children}
        </main>
    )
}
