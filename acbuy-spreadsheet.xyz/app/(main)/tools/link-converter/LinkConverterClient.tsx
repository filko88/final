"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Link as LinkIcon } from "lucide-react"
import { convertLink } from "@/app/actions/link-converter"

interface AffiliateApiResponse {
  rawlink: string
  id: string
  marketplace: string
  [agent: string]: string
}

interface ConvertedResult {
  original: string
  data: AffiliateApiResponse | null
  error?: string
}


export default function LinkConverterClient() {
  const [inputLinks, setInputLinks] = useState("")
  const [results, setResults] = useState<ConvertedResult[]>([])
  const [isConverting, setIsConverting] = useState(false)

  const links = useMemo(
    () =>
      inputLinks
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean),
    [inputLinks]
  )

  const convertLinks = async () => {
    if (!links.length) return
    setIsConverting(true)
    try {
      const fetched = await Promise.all(
        links.map(async (link) => {
          try {
            const result = await convertLink(link)
            if ("error" in result) {
              return { original: link, data: null, error: result.error }
            }
            const json = result.data as AffiliateApiResponse
            const agentEntries = Object.entries(json).filter(
              ([k, v]) =>
                k.toLowerCase() === "acbuy" &&
                !["rawlink", "id", "marketplace", "eastmallbuy", "pandabuy", "joyagoo"].includes(k) &&
                typeof v === "string" &&
                v.trim() !== ""
            )
            if (!agentEntries.length) {
              return { original: link, data: null, error: "Unsupported or empty response" }
            }
            return { original: link, data: json }
          } catch {
            return { original: link, data: null, error: "Network error" }
          }
        })
      )
      setResults(fetched)
    } finally {
      setIsConverting(false)
    }
  }

  return (
    <div className="space-y-10 pt-8">
      <section className="relative overflow-hidden rounded-3xl border border-foreground/10 bg-background/70 p-6 sm:p-10 backdrop-blur-lg shadow-[0_18px_40px_-30px_rgba(15,23,42,0.6)]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-foreground/10 to-transparent" />
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3 max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-foreground/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Tools
            </span>
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-foreground">Link converter</h1>
            <p className="text-base sm:text-lg text-muted-foreground">
              Paste Taobao/Weidian links, convert to agent-ready URLs, and copy fast.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/finds">Browse rep spreadsheet</Link>
            </Button>
            <Button variant="secondary" asChild size="lg">
              <Link href="/tools/qc-checker">Open QC checker</Link>
            </Button>
          </div>
        </div>
        <p className="mt-4 text-sm text-muted-foreground max-w-2xl">
          Supports bulk conversion, instant agent routing, and quick copy for your next haul.
        </p>
      </section>

      <Card className="rounded-2xl border border-foreground/10 bg-background/60 shadow-sm backdrop-blur">
        <CardHeader className="flex flex-col gap-3">
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            Convert links
          </CardTitle>
          <CardDescription>Paste one link per line. We’ll fetch agent links and show them below.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={inputLinks}
            onChange={(e) => setInputLinks(e.target.value)}
            placeholder="Paste Taobao/Weidian/1688 links...\nOne per line"
            className="min-h-[140px] bg-foreground/5 border-foreground/10"
          />
          <div className="flex flex-wrap gap-3 justify-end">
            <Button onClick={convertLinks} disabled={!links.length || isConverting}>
              {isConverting ? "Converting..." : "Convert"}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-4 rounded-2xl border border-foreground/10 bg-background/60 p-6 shadow-sm">
        <div className="space-y-1.5">
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground">Converted links</h2>
          <p className="text-sm text-muted-foreground">Results appear instantly below when conversions finish.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {results.map((res) => {
            const data = res.data
            if (!data) {
              return (
                <Card key={res.original} className="rounded-2xl border border-destructive/20 bg-destructive/5">
                  <CardHeader>
                    <CardTitle className="text-destructive truncate">{res.original}</CardTitle>
                    <CardDescription className="text-destructive/80">{res.error || "Conversion failed"}</CardDescription>
                  </CardHeader>
                </Card>
              )
            }

            const agentLinks = Object.entries(data).filter(
              ([k, v]) =>
                k.toLowerCase() === "acbuy" &&
                !["rawlink", "id", "marketplace", "eastmallbuy", "pandabuy", "joyagoo"].includes(k) &&
                typeof v === "string" &&
                v.trim() !== ""
            )

            return (
              <Card key={res.original} className="rounded-2xl border border-foreground/10 bg-background/50 backdrop-blur">
                <CardHeader className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <CardTitle className="text-foreground">Converted link</CardTitle>
                    <Badge variant="outline" className="uppercase tracking-wide text-[10px]">
                      {data.marketplace || "unknown"}
                    </Badge>
                  </div>
                  <CardDescription className="text-muted-foreground">
                    {res.original}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {agentLinks.map(([agent, url]) => (
                      <Button key={agent} asChild variant="secondary" className="capitalize">
                        <a href={url} target="_blank" rel="noopener noreferrer">
                          {agent}
                        </a>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {!results.length && (
            <Card className="rounded-2xl border border-foreground/10 bg-background/50 backdrop-blur">
              <CardHeader>
                <CardTitle>No results yet</CardTitle>
                <CardDescription>Paste links and hit convert to see agent URLs.</CardDescription>
              </CardHeader>
            </Card>
          )}
        </div>
      </section>
    </div>
  )
}
