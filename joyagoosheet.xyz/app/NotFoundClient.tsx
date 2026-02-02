"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, ArrowLeft } from "lucide-react"

export default function NotFoundClient() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-background text-foreground">
      <div className="max-w-md space-y-4">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Error 404</p>
        <h1 className="text-3xl sm:text-4xl font-semibold">Page not found</h1>
        <p className="text-sm text-muted-foreground">
          The page you are looking for doesn’t exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild>
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              Go home
            </Link>
          </Button>
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go back
          </Button>
        </div>
      </div>
    </div>
  )
}
