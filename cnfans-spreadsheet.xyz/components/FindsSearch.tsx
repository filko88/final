"use client"

import { useEffect, useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search } from "lucide-react"
import { useDebounce } from "@/hooks/use-debounce"

export function FindsSearch() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [value, setValue] = useState(searchParams.get("q") ?? "")
    const [isPending, startTransition] = useTransition()

    // Debounce the value to avoid rapid URL updates
    const debouncedValue = useDebounce(value, 300)

    useEffect(() => {
        // Determine if we need to update the URL
        const currentQ = searchParams.get("q") ?? ""
        if (debouncedValue !== currentQ) {
            const params = new URLSearchParams(searchParams.toString())
            if (debouncedValue) {
                params.set("q", debouncedValue)
            } else {
                params.delete("q")
            }
            startTransition(() => {
                router.replace(`/finds?${params.toString()}`)
            })
        }
    }, [debouncedValue, router, searchParams])

    return (
        <div className="w-full max-w-4xl px-0 relative z-20">
            <div className="relative group">
                {/* Removed glow effect for clean white look */}
                <div className="relative flex items-center bg-background border border-border rounded-xl p-2.5 shadow-sm">
                    <Search className="w-5 h-5 text-muted-foreground ml-3 mr-3" />
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder="Search for brands, shoes, clothing..."
                        className="w-full bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none text-base py-1 font-medium"
                    />
                </div>
            </div>
        </div>
    )
}
