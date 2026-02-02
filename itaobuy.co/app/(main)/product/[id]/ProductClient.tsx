"use client"

import { useEffect, useMemo, useState, useRef } from "react"
import Link from "next/link"
import { Camera, Share2, ExternalLink, Sparkles, RotateCw, Image as ImageIcon, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { usePreferences, currencyOptions, agentOptions, type Agent } from "@/hooks/use-preferences"
import { generateAgentLink, extractIdAndMarketplace, normalizeAgentUrlToRaw } from "@/app/lib/link-converter"
import { useCreatorAffiliateCode } from "@/lib/creator-affiliates"
import { fetchQcGrouped, type QcGroupedGroup } from "./actions"
import type { NormalizedFind } from "@/lib/finds-source"
import ProductCarousel from "@/components/ProductCarousel"
import { safeFetchFinds } from "@/lib/finds-source"

interface ProductClientProps {
    product: NormalizedFind
}

export default function ProductClient({ product }: ProductClientProps) {
  const { selectedCurrency, selectedAgent, convertFromCny, isLoaded, ratesLoaded } = usePreferences()
  const creatorAffiliateCode = useCreatorAffiliateCode(selectedAgent as Agent)
  const [isHydrated, setIsHydrated] = useState(false)
  const [qcGroups, setQcGroups] = useState<QcGroupedGroup[] | null>(null)
  const [qcLoading, setQcLoading] = useState(false)
  const [qcError, setQcError] = useState<string | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewAlbumIndex, setPreviewAlbumIndex] = useState<number | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const isPanningRef = useRef(false)
  const panStartRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null)
  const touchesRef = useRef<Map<number, { x: number; y: number }>>(new Map())
  const lastPinchDataRef = useRef<{ distance: number; scale: number } | null>(null)
  const [trendingItems, setTrendingItems] = useState<NormalizedFind[]>([])

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const allFinds = await safeFetchFinds()
        const trending = allFinds
          .slice()
          .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
          .slice(0, 15)
        setTrendingItems(trending)
      } catch (error) {
        console.error("Failed to fetch trending items:", error)
      }
    }
    fetchTrending()
  }, [])

  const priceReady = isLoaded && (selectedCurrency === "cny" || ratesLoaded)
  const displayPrice = priceReady ? convertFromCny(product.price) : 0
  const currencySymbol = currencyOptions.find(c => c.value === selectedCurrency)?.symbol || "$"
    const agentLabel = agentOptions.find(a => a.value === selectedAgent)?.label || "Agent"

  const handleCopyLink = async () => {
    const url = typeof window !== "undefined" ? window.location.href : ""
    if (!url) return
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(url)
      } else {
        const input = document.createElement("input")
        input.value = url
        document.body.appendChild(input)
        input.select()
        document.execCommand("copy")
        input.remove()
      }
      toast.success("Link copied")
    } catch (error) {
      toast.error("Unable to copy link")
    }
  }

  useEffect(() => {
    document.body.classList.add("product-page-active")
    return () => {
      document.body.classList.remove("product-page-active")
    }
  }, [])

  const qcSourceUrl = useMemo(() => {
    const input = product.rawUrl || product.link || ""
    if (!input) return ""
    return normalizeAgentUrlToRaw(input)
  }, [product.link, product.rawUrl])

  const qcCount = useMemo(() => {
    if (!qcGroups) return 0
    return qcGroups.reduce((sum, group) => sum + (group.total_images ?? group.images.length), 0)
  }, [qcGroups])

  const qcAlbumSlots = 3
  const qcAlbumsToShow = qcGroups ? qcGroups.slice(0, qcAlbumSlots) : []
  const showQcMore = Boolean(qcGroups && qcGroups.length > qcAlbumSlots)
  const previewAlbum = (previewAlbumIndex !== null && qcGroups) ? qcGroups[previewAlbumIndex] : null

  useEffect(() => {
    if (!previewOpen) return
    let viewportMeta: HTMLMetaElement | null = null
    if (typeof document !== "undefined") {
      document.body.style.overflow = "hidden"
      document.body.style.touchAction = "none"
      // Temporarily prevent page zoom
      viewportMeta = document.querySelector('meta[name="viewport"]')
      if (viewportMeta) {
        const original = viewportMeta.getAttribute("content")
        viewportMeta.setAttribute("content", "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no")
        return () => {
          document.body.style.overflow = ""
          document.body.style.touchAction = ""
          if (viewportMeta && original) viewportMeta.setAttribute("content", original)
        }
      }
    }
    return () => {
      if (typeof document !== "undefined") {
        document.body.style.overflow = ""
        document.body.style.touchAction = ""
      }
    }
  }, [previewOpen])

  useEffect(() => {
    if (!previewOpen || !previewAlbum) return
    const handler = (e: KeyboardEvent) => {
      const total = previewAlbum.images.length
      if (!total) return
      if (e.key === "ArrowLeft") {
        setCurrentIndex((i) => (i - 1 + total) % total)
        setPan({ x: 0, y: 0 })
      } else if (e.key === "ArrowRight") {
        setCurrentIndex((i) => (i + 1) % total)
        setPan({ x: 0, y: 0 })
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [previewOpen, previewAlbum])

  useEffect(() => {
    let active = true
    const loadQc = async () => {
      if (!qcSourceUrl || !qcSourceUrl.startsWith("http")) {
        if (active) {
          setQcGroups([])
        }
        return
      }
      setQcLoading(true)
      setQcError(null)
      try {
        const resp = await fetchQcGrouped(qcSourceUrl)
        if (!active) return
        if ("error" in resp) {
          setQcError(resp.error)
          setQcGroups([])
          return
        }
        setQcGroups(resp.groups || [])
      } catch {
        if (!active) return
        setQcError("Failed to load QC photos")
        setQcGroups([])
      } finally {
        if (active) setQcLoading(false)
      }
    }
    void loadQc()
    return () => {
      active = false
    }
  }, [qcSourceUrl])

  // Choose the best link: agent specific -> direct link -> raw url
  // Generate buy link dynamically
  // Aggressively normalize in case existing data is dirty.
  const buyLink = useMemo(() => {
    let link: string | undefined
    if (product.rawUrl || product.link) {
      const input = product.rawUrl || product.link || ""
      const raw = normalizeAgentUrlToRaw(input)
      const { productId, marketplace } = extractIdAndMarketplace(raw)
      if (productId && marketplace) {
        link = generateAgentLink(
          selectedAgent,
          marketplace,
          productId,
          raw,
          isHydrated ? creatorAffiliateCode || undefined : undefined
        ) || undefined
      }
    }
    return link || product.link || product.rawUrl || "#"
  }, [creatorAffiliateCode, isHydrated, product.link, product.rawUrl, selectedAgent])

  return (
    <>
    <div className="product-page min-h-screen bg-background text-foreground pb-20">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.18),_transparent_55%)]" />
        <div className="absolute right-0 top-0 h-72 w-72 -translate-y-24 translate-x-16 rounded-full bg-gradient-to-br from-foreground/10 via-foreground/5 to-transparent blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-[1920px] px-4 pb-16 pt-6 sm:px-8 sm:pt-10">
        <section className="relative hidden overflow-hidden rounded-3xl border border-foreground/10 bg-background/70 p-6 sm:p-10 backdrop-blur-lg shadow-[0_18px_40px_-30px_rgba(15,23,42,0.6)] md:block">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-foreground/10 to-transparent" />
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-4">
              <nav className="flex items-center gap-2 text-xs text-muted-foreground">
                <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
                <span className="text-foreground/30">/</span>
                <Link href="/finds" className="hover:text-foreground transition-colors">Finds</Link>
                <span className="text-foreground/30">/</span>
                <span className="text-foreground/80 line-clamp-1">{product.name}</span>
              </nav>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-foreground">
                {product.name}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <Button
                size="lg"
                variant="outline"
                className="hidden h-12 w-12 rounded-full border-foreground/15 bg-background/70 backdrop-blur-md p-0 md:inline-flex"
                onClick={handleCopyLink}
                aria-label="Copy link"
                title="Copy link"
              >
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>

        <div className="mt-8 md:mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="md:hidden space-y-3">
            <nav className="flex items-center gap-2 text-xs text-muted-foreground">
              <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
              <span className="text-foreground/30">/</span>
              <Link href="/finds" className="hover:text-foreground transition-colors">Finds</Link>
              <span className="text-foreground/30">/</span>
              <span className="text-foreground/80 line-clamp-1">{product.name}</span>
            </nav>
          </div>
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="relative overflow-hidden rounded-2xl md:rounded-3xl md:border md:border-foreground/10 md:bg-background/70 md:shadow-lg md:backdrop-blur-lg">
              <div className="aspect-square bg-background/50">
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="md:rounded-3xl md:border md:border-foreground/10 md:bg-background/70 md:p-6 md:backdrop-blur-lg md:shadow-[0_16px_32px_-28px_rgba(15,23,42,0.6)]">
              <div className="md:hidden space-y-2">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                  {product.name}
                </h1>
                {priceReady ? (
                  <div className="text-2xl font-semibold text-foreground">
                    {currencySymbol}{displayPrice.toFixed(2)}
                  </div>
                ) : (
                  <div className="h-7 w-28 rounded-xl bg-foreground/10 animate-pulse" />
                )}
              </div>
              <div className="hidden items-center justify-between md:flex">
                <div className="text-lg font-semibold text-foreground">Selected agent</div>
                <span className="inline-flex items-center gap-1 rounded-full border border-foreground/10 bg-foreground/5 px-2 py-1 text-[11px] font-semibold text-foreground/80">
                  <Sparkles className="h-3 w-3" />
                  {agentLabel}
                </span>
              </div>
              <div className="mt-4 hidden items-end justify-between gap-4 md:flex">
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Price</div>
                  {priceReady ? (
                    <div className="text-3xl font-semibold text-foreground">
                      {currencySymbol}{displayPrice.toFixed(2)}
                    </div>
                  ) : (
                    <div className="mt-2 h-8 w-32 rounded-xl bg-foreground/10 animate-pulse" />
                  )}
                </div>
                <Button asChild size="lg" className="hidden h-12 rounded-full bg-foreground text-background hover:bg-foreground/90 shadow-lg md:inline-flex">
                  <a href={buyLink} target="_blank" rel="noopener noreferrer" suppressHydrationWarning>
                    Buy
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>

            <div className="md:rounded-3xl md:border md:border-foreground/10 md:bg-background/70 md:p-6 md:backdrop-blur-lg md:shadow-[0_16px_32px_-28px_rgba(15,23,42,0.6)]">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">QC Photos</h3>
                {qcCount > 0 && (
                  <span className="text-xs text-black">
                    powered by{" "}
                    <a
                      href="https://picks.ly"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#ff7a00] underline"
                    >
                      picks.ly
                    </a>
                  </span>
                )}
              </div>
              {qcLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="aspect-square rounded-2xl border border-foreground/10 bg-foreground/5 animate-pulse"
                    />
                  ))}
                </div>
              ) : qcError ? (
                <div className="text-sm text-red-400">{qcError}</div>
              ) : !qcGroups || qcGroups.length === 0 ? (
                <div className="text-sm text-muted-foreground">No QC photos yet.</div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {qcAlbumsToShow.map((group, idx) => (
                    <button
                      key={`${group.qc_group || group.group_name || "group"}-${idx}`}
                      type="button"
                      onClick={() => {
                        if (!group.images.length) return
                        setPreviewAlbumIndex(idx)
                        setCurrentIndex(0)
                        setScale(1)
                        setRotation(0)
                        setPan({ x: 0, y: 0 })
                        setPreviewOpen(true)
                      }}
                      className="group relative aspect-square overflow-hidden rounded-2xl border border-foreground/10 bg-foreground/5"
                    >
                      {group.images[0]?.url ? (
                        <img
                          src={group.images[0].url}
                          alt="QC album cover"
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground/60">
                          <Camera className="h-6 w-6" />
                        </div>
                      )}
                    </button>
                  ))}
                  {qcSourceUrl && showQcMore && (
                    <Link
                      href={`/tools/qc-checker?url=${encodeURIComponent(qcSourceUrl)}`}
                      className="group relative aspect-square overflow-hidden rounded-2xl border border-foreground/10 bg-foreground/5 flex items-center justify-center text-sm font-medium text-muted-foreground transition-colors hover:bg-foreground/10"
                    >
                      <div className="text-center">
                        <div className="text-foreground">View More</div>
                      </div>
                    </Link>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>

        {trendingItems.length > 0 && (
          <div className="mt-12 max-w-[1600px] mx-auto">
            <ProductCarousel
              title="Trending Items"
              products={trendingItems.map((item) => ({
                _id: item._id,
                name: item.name,
                price: item.price,
                image: item.image,
                link: item.link,
                marketplace: item.marketplace || "Marketplace",
                type: "finds" as const,
                "category[0]": item["category[0]"],
                "category[1]": item["category[1]"],
                "category[2]": item["category[2]"],
                brand: item.brand,
                batch: item.batch || undefined,
                view_count: item.view_count,
                created_by: item.created_by,
                created_at: item.created_at,
                updated_at: item.updated_at,
              }))}
              currency={selectedCurrency}
              selectedAgent={selectedAgent}
              convertFromCny={convertFromCny}
              viewAllHref="/finds"
              viewAllLabel="View all"
            />
          </div>
        )}

        <Button
          size="lg"
          variant="outline"
          className="fixed bottom-36 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-foreground/10 bg-foreground text-white shadow-lg shadow-foreground/20 transition hover:bg-foreground/90 p-0 md:hidden"
          onClick={handleCopyLink}
          aria-label="Copy link"
          title="Copy link"
        >
          <Share2 className="h-5 w-5" />
        </Button>
        <a
          href="https://discord.gg/certifiedwarrior"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Join our Discord"
          className="fixed bottom-20 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-foreground/10 bg-foreground text-background shadow-lg shadow-foreground/20 transition hover:bg-foreground/90 md:hidden"
        >
          <img
            src="https://img.icons8.com/?size=100&id=87002&format=png&color=FFFFFF"
            alt=""
            className="h-5 w-5"
            loading="lazy"
          />
        </a>
        <style jsx global>{`
          @media (max-width: 768px) {
            .product-page-active .discord-fab {
              display: none;
            }
          }
        `}</style>
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-foreground/10 bg-background/80 px-4 py-3 backdrop-blur-lg md:hidden">
          <Button asChild size="lg" className="h-12 w-full rounded-full bg-foreground text-background hover:bg-foreground/90 shadow-lg">
            <a href={buyLink} target="_blank" rel="noopener noreferrer">
              Buy now
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
    </div>
      <Dialog
      open={previewOpen}
      onOpenChange={(open) => {
        setPreviewOpen(open)
        if (!open) {
          setScale(1)
          setRotation(0)
          setPan({ x: 0, y: 0 })
          setPreviewAlbumIndex(null)
        }
      }}
    >
      <DialogContent className="w-screen h-screen max-w-none p-0 rounded-none border-0 bg-black overflow-hidden">
        {previewAlbum && (
          <>
            <DialogHeader className="sr-only">
              <DialogTitle>QC album</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col h-full">
              <div className="relative flex-1 bg-black" style={{ touchAction: "none" }}>
                <div
                  className="absolute inset-0 overflow-hidden"
                  onTouchMove={(e) => e.preventDefault()}
                >
                  <img
                    src={previewAlbum.images[currentIndex]?.url}
                    alt={`QC ${currentIndex + 1}`}
                    draggable={false}
                    className="absolute top-1/2 left-1/2 select-none"
                    style={{
                      transform: `translate(-50%, -50%) translate(${pan.x}px, ${pan.y}px) rotate(${rotation}deg) scale(${scale})`,
                      transition: isPanningRef.current ? "none" : "transform 0ms",
                      maxWidth: "100%",
                      maxHeight: "100%",
                      objectFit: scale === 1 && rotation % 180 === 0 ? "contain" : undefined,
                      touchAction: "none",
                      userSelect: "none",
                      WebkitUserSelect: "none",
                    }}
                    onTouchStart={(e) => {
                      e.preventDefault()
                      const touches = Array.from(e.touches)
                      touchesRef.current.clear()
                      touches.forEach((touch) => {
                        touchesRef.current.set(touch.identifier, { x: touch.clientX, y: touch.clientY })
                      })

                      if (touches.length === 2) {
                        const dx = touches[0].clientX - touches[1].clientX
                        const dy = touches[0].clientY - touches[1].clientY
                        lastPinchDataRef.current = { distance: Math.hypot(dx, dy), scale }
                        isPanningRef.current = false
                        panStartRef.current = null
                      } else if (touches.length === 1) {
                        isPanningRef.current = true
                        panStartRef.current = { x: touches[0].clientX, y: touches[0].clientY, panX: pan.x, panY: pan.y }
                        lastPinchDataRef.current = null
                      }
                    }}
                    onTouchMove={(e) => {
                      e.preventDefault()
                      const touches = Array.from(e.touches)
                      
                      if (touches.length === 2 && lastPinchDataRef.current) {
                        const dx = touches[0].clientX - touches[1].clientX
                        const dy = touches[0].clientY - touches[1].clientY
                        const distance = Math.hypot(dx, dy)
                        const ratio = distance / lastPinchDataRef.current.distance
                        const newScale = Math.min(5, Math.max(0.5, lastPinchDataRef.current.scale * ratio))
                        setScale(+newScale.toFixed(2))
                      } else if (touches.length === 1 && isPanningRef.current && panStartRef.current) {
                        const deltaX = touches[0].clientX - panStartRef.current.x
                        const deltaY = touches[0].clientY - panStartRef.current.y
                        setPan({ x: panStartRef.current.panX + deltaX, y: panStartRef.current.panY + deltaY })
                      }
                    }}
                    onTouchEnd={(e) => {
                      e.preventDefault()
                      if (e.touches.length < 2) {
                        lastPinchDataRef.current = null
                      }
                      if (e.touches.length === 0) {
                        isPanningRef.current = false
                        panStartRef.current = null
                        touchesRef.current.clear()
                      }
                    }}
                    onDoubleClick={() => {
                      if (scale !== 1 || rotation !== 0 || pan.x !== 0 || pan.y !== 0) {
                        setScale(1)
                        setRotation(0)
                        setPan({ x: 0, y: 0 })
                      } else {
                        setScale(2)
                      }
                    }}
                    onWheel={(e) => {
                      e.preventDefault()
                      const delta = Math.sign(e.deltaY)
                      if (delta < 0) setScale((s) => Math.min(5, +(s + 0.2).toFixed(2)))
                      if (delta > 0) setScale((s) => Math.max(0.5, +(s - 0.2).toFixed(2)))
                    }}
                  />
                </div>

                <div className="absolute top-[calc(env(safe-area-inset-top)+24px)] right-4 flex items-center gap-2 z-20">
                  <button
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-black/70 border border-white/20 text-white hover:bg-white/10 shadow-lg"
                    onClick={() => setRotation((r) => (r + 90) % 360)}
                    aria-label="Rotate"
                  >
                    <RotateCw className="h-5 w-5" />
                  </button>
                  <button
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-black/70 border border-white/20 text-white hover:bg-white/10 shadow-lg"
                    onClick={() => setPreviewOpen(false)}
                    aria-label="Close"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="absolute top-[calc(env(safe-area-inset-top)+24px)] left-4 text-sm text-white bg-black/70 border border-white/20 rounded-full px-3 py-1.5 shadow-lg z-20">
                  {currentIndex + 1} / {previewAlbum.images.length}
                </div>
                <div className="absolute bottom-[calc(env(safe-area-inset-bottom)+16px)] inset-x-0 px-4 z-20">
                  <div className="bg-black/80 border border-white/10 backdrop-blur rounded-2xl shadow-2xl p-3">
                    <div className="flex items-center gap-2 overflow-x-auto overflow-y-hidden scrollbar-hide">
                      {previewAlbum.images.map((image, idx) => (
                        <button
                          key={image.url}
                          className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border transition-all ${idx === currentIndex ? "border-white ring-2 ring-white/40 opacity-100" : "border-white/20 opacity-50 hover:opacity-75"}`}
                          onClick={() => {
                            setCurrentIndex(idx)
                            setPan({ x: 0, y: 0 })
                            setScale(1)
                            setRotation(0)
                          }}
                          aria-label={`Preview ${idx + 1}`}
                        >
                          <img src={image.url} alt={`Thumbnail ${idx + 1}`} className="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </DialogContent>
      </Dialog>
    </>
    )
}
