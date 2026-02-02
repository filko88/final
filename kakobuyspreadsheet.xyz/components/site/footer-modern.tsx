"use client"

import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { siteConfig } from "@/config/site"
import { Button } from "@/components/ui/button"
import { BrandMark } from "@/components/site/brand"

const footerLinks = [
  {
    heading: "Pages",
    items: [
      { href: "/finds", label: "Finds" },
      { href: "/sellers", label: "Sellers" },
      { href: "/tools", label: "Tools" },
      { href: "/tutorials", label: "Tutorials" },
    ],
  },
  {
    heading: "Resources",
    items: [
      { href: "/legal", label: "Legal" },
    ],
  },
]

export function FooterModern() {
  return (
    <footer className="relative border-t border-foreground/5 bg-background/60 backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-foreground/5 via-transparent to-transparent" aria-hidden />
      <div className="mx-auto flex max-w-[1920px] flex-col gap-12 px-4 py-12 sm:px-8">
        <div className="grid gap-10 md:grid-cols-[1.6fr_1fr_1fr]">
          <div className="space-y-4">
            <BrandMark showTagline />
            <p className="max-w-md text-sm text-muted-foreground">
              {siteConfig.siteDescription}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-foreground/10 border-none">
                <Link href="/finds" className="flex items-center gap-2">
                  Rep finds <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          {footerLinks.map((section) => (
            <div key={section.heading} className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground/80">{section.heading}</h4>
              <ul className="space-y-2">
                {section.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm text-muted-foreground transition hover:text-foreground"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-4 border-t border-foreground/10 pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} {siteConfig.siteName}. All rights reserved.</span>
          <div className="flex gap-3 text-muted-foreground">
            <Link href="/legal#privacy" className="hover:text-foreground">Privacy</Link>
            <Link href="/legal#terms" className="hover:text-foreground">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

