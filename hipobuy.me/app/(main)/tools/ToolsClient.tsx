"use client"

import { ArrowRight, CheckCircle2, Eye, Link as LinkIcon, Scale } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const tools = [
  {
    id: "link-converter",
    title: "Link converter",
    description: "Use our universal link converter",
    href: "/tools/link-converter",
    icon: <LinkIcon className="h-5 w-5" />,
    badge: "Free",
  },
  {
    id: "qc-checker",
    title: "QC checker",
    description: "Best QC finder on the scene!",
    href: "/tools/qc-checker",
    icon: <CheckCircle2 className="h-5 w-5" />,
    badge: "QC",
  },
]

export default function ToolsClient() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.18),_transparent_55%)]" />
        <div className="absolute right-0 top-0 h-72 w-72 -translate-y-24 translate-x-16 rounded-full bg-gradient-to-br from-foreground/10 via-foreground/5 to-transparent blur-3xl" />
      </div>

      <div className="relative pt-6 sm:pt-10">
        <section className="relative overflow-hidden rounded-3xl border border-foreground/10 bg-background/70 p-6 sm:p-10 backdrop-blur-lg shadow-[0_18px_40px_-30px_rgba(15,23,42,0.6)]">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-foreground/10 to-transparent" />
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3 max-w-xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-foreground/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Tools
              </span>
              <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight">
                Rep-Finds tools, rebuilt.
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground">
                Fast utilities for links, QC, and workflows that keep your rep hunt moving.
              </p>
            </div>
          </div>
        </section>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <Card
              key={tool.id}
              className="group relative overflow-hidden rounded-3xl border border-foreground/10 bg-background shadow transition-all duration-300 hover:-translate-y-1 hover:border-foreground/20 hover:shadow-md"
            >
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                <div className="flex items-center gap-2 text-foreground">
                  {tool.icon}
                  <span className="text-xs uppercase tracking-[0.15em] text-foreground/90">{tool.badge}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <CardTitle className="text-lg text-foreground">{tool.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{tool.description}</p>
                </div>
                <Button asChild variant="secondary" className="w-full justify-between">
                  <Link href={tool.href}>
                    Open tool
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
