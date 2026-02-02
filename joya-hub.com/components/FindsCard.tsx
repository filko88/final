"use client"
/* eslint-disable @next/next/no-img-element */

import Link from "next/link"
import { memo, useEffect, useState } from "react"
import { ArrowUpRight, Camera } from "lucide-react"
import { type Currency, currencyOptions, type Agent, agentOptions } from "@/hooks/use-preferences"
import type { NormalizedFind } from "@/lib/finds-source"

import { generateAgentLink, extractIdAndMarketplace, normalizeAgentUrlToRaw } from "@/app/lib/link-converter"
import { useCreatorAffiliateCode } from "@/lib/creator-affiliates"

interface FindsCardProps {
  product: NormalizedFind
  currency: Currency
  selectedAgent: Agent
  convertFromCny: (priceCny: number | null | undefined) => number
}

const getCurrencySymbol = (currency: Currency): string => {
  const option = currencyOptions.find(c => c.value === currency)
  return option?.symbol || "$"
}

const SHORT_LINK_PLATFORMS = new Set(["taobao", "weidian", "1688"])
const AGENT_VALUES = new Set(agentOptions.map((agent) => agent.value))

const rewriteAgentShortLink = (
  urlStr: string,
  preferredAgent: Agent,
  affiliateCodeOverride?: string | null
) => {
  try {
    const url = new URL(urlStr)
    const parts = url.pathname.split("/").filter(Boolean)
    if (parts.length < 3) return null
    const [agent, platform, productId, affiliateCodeFromUrl] = parts
    if (!AGENT_VALUES.has(agent as Agent) || !SHORT_LINK_PLATFORMS.has(platform)) return null
    const affiliateCode = affiliateCodeOverride || affiliateCodeFromUrl
    const affSegment = affiliateCode ? `/${encodeURIComponent(affiliateCode)}` : ""
    const rebuilt = `${url.origin}/${preferredAgent}/${platform}/${productId}${affSegment}`
    return {
      link: url.search ? `${rebuilt}${url.search}` : rebuilt,
      marketplace: platform,
      productId,
    }
  } catch {
    return null
  }
}

const FindsCard = memo(({ product, currency, selectedAgent, convertFromCny }: FindsCardProps) => {
  const agentLabel = agentOptions.find(a => a.value === selectedAgent)?.label || "Agent"
  const creatorAffiliateCode = useCreatorAffiliateCode(selectedAgent)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])



  // Generate primary link dynamically on the client
  let primaryLink = "#"
  let extractedMarketplaceForDisplay: string | undefined
  const inputUrl = product.rawUrl || product.link || ""

  const effectiveAffiliateCode = isHydrated ? creatorAffiliateCode : null
  const shortLink = rewriteAgentShortLink(inputUrl, selectedAgent, effectiveAffiliateCode)
  if (shortLink) {
    primaryLink = shortLink.link
    extractedMarketplaceForDisplay = shortLink.marketplace
  } else {
    try {
      // Aggressively normalize whatever link we have.
      // If the database contains a 'rawUrl' that is actually a broken agent link, we must fix it here.
      const raw = normalizeAgentUrlToRaw(inputUrl)

      // Extract ID from the definitively raw URL
      const { productId, marketplace } = extractIdAndMarketplace(raw)
      extractedMarketplaceForDisplay = marketplace

      if (productId && marketplace) {
        primaryLink = generateAgentLink(
          selectedAgent,
          marketplace,
          productId,
          raw,
          effectiveAffiliateCode || undefined
        ) || ""
      }
    } catch (e) {
      console.error("Error generating link", e)
    }
  }

  // Fallback if generation failed
  primaryLink = primaryLink || product.link || product.rawUrl || "#"
  const displayPrice = convertFromCny(product.price)
  const marketplace = product.marketplace || extractedMarketplaceForDisplay || 'unknown'



  const isNew = (() => {
    if (!product.created_at) return false
    const created = new Date(product.created_at)
    if (Number.isNaN(created.getTime())) return false
    const now = Date.now()
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000
    return now - created.getTime() <= sevenDaysMs
  })()

  return (
    <div className="group block h-full" aria-label={`View ${product.name}`}>
      <div className="relative flex h-full flex-col overflow-hidden rounded-lg border border-foreground/10 bg-card p-2.5 shadow-sm transition hover:shadow-md">
        {/* Removed dark gradient overlay */}

        {/* Card Content */}

        <div className="relative flex h-full flex-col gap-2">
          {/* Main Card Content linked to Product Page */}
          <Link href={`/product/${product._id}`} className="block relative aspect-square overflow-hidden rounded-md border border-foreground/10 bg-foreground/5 cursor-pointer" prefetch={false}>
            <img
              alt={product.name}
              className="h-full w-full object-cover transition duration-400"
              src={product.image}
              loading="lazy"
              referrerPolicy="no-referrer"
            />

            <div className="pointer-events-none absolute inset-0 flex items-start justify-start p-1.5 sm:p-2">
              {isNew && (
                <span className="inline-flex items-center gap-1 rounded-full bg-background/80 px-2 py-0.5 text-[10px] font-medium text-foreground shadow-sm backdrop-blur">
                  New
                </span>
              )}
            </div>
          </Link>

          <div className="relative flex flex-1 flex-col gap-1">
            <Link href={`/product/${product._id}`} className="flex min-w-0 flex-col gap-1 cursor-pointer" prefetch={false}>
              <p className="truncate text-sm font-semibold text-foreground">{product.name}</p>
              <span className="text-sm font-bold text-foreground/90">
                {getCurrencySymbol(currency)}
                {displayPrice.toFixed(2)}
              </span>
            </Link>

            <div className="mt-auto flex min-w-0 items-center gap-2 pt-1">
              {/* QC Button -> Internal Product Page */}
              <Link
                href={`/product/${product._id}`}
                className="inline-flex flex-1 sm:flex-none items-center justify-center gap-1.5 rounded-full border border-foreground/10 bg-background/70 px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm transition hover:bg-foreground/5"
                prefetch={false}
              >
                <Camera className="h-3.5 w-3.5" />
                QC
              </Link>

              {/* Buy Now Button -> External Agent Link */}
              <a
                href={primaryLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-full bg-foreground px-3 sm:px-4 py-1.5 text-xs font-semibold text-background shadow-md transition hover:bg-foreground/90 hover:shadow-lg touch-manipulation"
                onClickCapture={(e) => {
                  e.stopPropagation()
                }}
                onTouchStart={(e) => {
                  e.stopPropagation()
                }}
                suppressHydrationWarning
              >
                Buy
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

// Add display name for better debugging
FindsCard.displayName = 'FindsCard'

export default FindsCard
export type { FindsCardProps }