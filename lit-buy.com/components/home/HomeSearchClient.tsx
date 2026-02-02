"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"

export default function HomeSearchClient() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = () => {
    if (!searchQuery.trim()) return
    router.push(`/finds?q=${encodeURIComponent(searchQuery.trim())}`)
  }

  return (
    <div className="w-full max-w-2xl px-0 mb-4 relative z-20">
      <div className="relative group">
        <div className="relative flex items-center bg-background border border-border rounded-xl p-3 shadow-lg">
          <Search className="w-6 h-6 text-muted-foreground ml-3 mr-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch()
            }}
            placeholder="Search for brands, shoes, clothing..."
            className="w-full bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none text-base sm:text-lg py-1 font-medium"
          />
        </div>
      </div>
    </div>
  )
}
