import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getPageMetadata } from "@/lib/page-metadata"

export const metadata = getPageMetadata("links")

export default function LinksPage() {
  return (
    <div className="space-y-6">
      <p className="text-xs uppercase tracking-[0.2em] text-accent/80">Links</p>
      <h1 className="text-3xl sm:text-4xl font-semibold leading-tight text-foreground">Link utilities moved</h1>
      <p className="max-w-2xl text-sm text-muted-foreground">
        The link tools now live inside the dark, lime-accent Tools hub. Open it to access the converter and preview in one consistent layout.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/tools">Go to tools</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/finds">Browse Rep Spreadsheet</Link>
        </Button>
      </div>
    </div>
  )
}
