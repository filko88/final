"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
// import { useLanguage } from "@/components/LanguageProvider"
import {
  Truck,
  Package,
  Plane,
  Clock,
  CheckCircle,
  MapPin,
  Zap,
  Pencil,
  Check,
  X,
  Trash2,
  ChevronRight
} from "lucide-react"
import { getHandshakeKey } from "@/app/actions/handshake"

interface TrackingEvent {
  id: string
  timestamp: string
  location: string
  status: string
  description: string
}

interface SavedTrackingItem {
  id: string
  trackingNumber: string
  name: string
  lastUpdated: number
  status?: string
}

const STORAGE_KEY = "acbuy-spreadsheet_tracking_numbers"

// Removed carrier list – carrier selection not required

type PTKEvent = {
  time_iso?: string
  time_utc?: string
  time?: string
  time_stamp?: number | string
  location?: string
  stage?: string
  description?: string
}

type PTKProvider = {
  events?: PTKEvent[]
}

type PTKData = {
  status?: string
  track_17?: { providers?: PTKProvider[] } | null
  track_docking?: PTKEvent[] | null
}

export default function ShippmentTrackingClient() {
  // const { language } = useLanguage()
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [trackingNumber, setTrackingNumber] = useState("")
  const [isTracking, setIsTracking] = useState(false)
  const [currentStatus, setCurrentStatus] = useState<string>("Not Tracked")
  const [eta, setEta] = useState<string | null>(null)
  const [events, setEvents] = useState<TrackingEvent[]>([])
  const [savedTrackings, setSavedTrackings] = useState<SavedTrackingItem[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState<string>("")
  const [error, setError] = useState<string | null>(null)

  const t = {
    explore: "Explore",
    repFindsTools: "acbuy-spreadsheet Tools",
    toolsDescription: "Essential utilities to speed up your rep shopping workflow",
    home: "Home",
    tools: "Tools",
    shipmentTracking: "Shipment Tracking",
    trackYourPackages: "Track your packages in real-time",
    enterTrackingNumber: "Enter tracking number from any carrier",
    track: "Track",
    tracking: "Tracking...",
    notTracked: "Not Tracked",
    noEvents: "No Events",
    savedTrackings: "Saved Trackings",
    addName: "Add Name",
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    noSavedTrackings: "No saved trackings",
    faqTitle: "Frequently Asked Questions",
    faq1Q: "Which carriers does the tracking tool support?",
    faq1A: "The tracking tool supports all major carriers including DHL, FedEx, UPS, EMS, China Post, SF Express, YunExpress, and many more. Simply enter your tracking number and the tool will automatically detect the carrier.",
    faq2Q: "How do I track my package?",
    faq2A: "Simply paste your tracking number into the input field and click 'Track'. The tool will search for your package and display a detailed timeline of its journey, current status, and estimated delivery date.",
    faq3Q: "Can I save tracking numbers for later?",
    faq3A: "Yes! The tool automatically saves your tracking numbers locally in your browser. You can easily access and track them again later, and even rename them for better organization.",
  }

  // Load saved trackings
  useEffect(() => {
    const loadSavedTrackings = () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) {
          const parsed: SavedTrackingItem[] = JSON.parse(raw)
          if (Array.isArray(parsed)) {
            setSavedTrackings(parsed.sort((a, b) => b.lastUpdated - a.lastUpdated))
          }
        }
      } catch (error) {
        console.error('Failed to load saved trackings:', error)
      }
    }

    // Ensure we're on the client side
    if (typeof window !== 'undefined') {
      loadSavedTrackings()
    }
  }, [])

  // Persist saved trackings
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedTrackings))
    } catch { }
  }, [savedTrackings])

  // Load tracking from query and auto track
  const autoRef = useRef(false)
  useEffect(() => {
    const trackingParam = searchParams.get('tracking')
    if (trackingParam) {
      const decoded = decodeURIComponent(trackingParam)
      setTrackingNumber(decoded)
      if (!autoRef.current) {
        autoRef.current = true
        if (decoded.trim()) setTimeout(() => { void trackPackage(decoded) }, 0)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const updateQuery = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, encodeURIComponent(value))
    else params.delete(key)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const generateMockEvents = () => {
    const now = new Date()
    const daysAgo = (n: number) => {
      const d = new Date(now)
      d.setDate(d.getDate() - n)
      return d
    }

    const format = (d: Date) => d.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    })

    const mockTimeline: TrackingEvent[] = [
      {
        id: "1",
        timestamp: format(daysAgo(6)),
        location: "Seller Facility",
        status: "Label Created",
        description: "Shipment information received"
      },
      {
        id: "2",
        timestamp: format(daysAgo(5)),
        location: "Origin Facility",
        status: "Picked Up",
        description: "Package received by carrier"
      },
      {
        id: "3",
        timestamp: format(daysAgo(3)),
        location: "Transit Hub",
        status: "In Transit",
        description: "Departed facility to international hub"
      },
      {
        id: "4",
        timestamp: format(daysAgo(2)),
        location: "Customs",
        status: "Customs Clearance",
        description: "Awaiting customs inspection"
      },
      {
        id: "5",
        timestamp: format(daysAgo(1)),
        location: "Destination Facility",
        status: "Out for Delivery",
        description: "Courier has the package"
      },
      {
        id: "6",
        timestamp: format(now),
        location: "Recipient Address",
        status: "Delivered",
        description: "Package delivered"
      }
    ]

    // Randomly decide how far along the shipment is (0..5, 6 means delivered)
    const progressIndex = Math.min(5, Math.floor(Math.random() * 6))
    const visibleEvents = mockTimeline.slice(0, progressIndex + 1)
    const latest = visibleEvents[visibleEvents.length - 1]

    setEvents(visibleEvents.reverse())
    setCurrentStatus(latest.status)

    if (latest.status === "Delivered") {
      setEta("Delivered today")
    } else {
      const etaDate = new Date(now)
      etaDate.setDate(now.getDate() + (6 - progressIndex))
      setEta(etaDate.toLocaleDateString())
    }
  }

  const upsertSavedTracking = (num: string, status?: string) => {
    if (!num) return
    setSavedTrackings(prev => {
      const idx = prev.findIndex(t => t.id === num)
      const now = Date.now()
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = { ...next[idx], lastUpdated: now, status: status || next[idx].status }
        return next.sort((a, b) => b.lastUpdated - a.lastUpdated)
      }
      return [
        { id: num, trackingNumber: num, name: num, lastUpdated: now, status },
        ...prev
      ].sort((a, b) => b.lastUpdated - a.lastUpdated)
    })
  }

  const trackPackage = async (overrideNumber?: string) => {
    const tn = (overrideNumber ?? trackingNumber).trim()
    if (!tn) return
    setIsTracking(true)
    setError(null)
    try {
      const { trackShipment } = await import("./actions")
      const encrypted = await encryptOnClient(tn)
      const data = await trackShipment(encrypted)
      if ("error" in data) {
        throw new Error(data.error)
      }
      setEvents(data.events)
      setCurrentStatus(data.status)
      setEta(data.eta)
      upsertSavedTracking(tn, data.status)
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to fetch tracking data"
      setError(message)
      setEvents([])
      setCurrentStatus("Not Tracked")
      setEta(null)
    } finally {
      setIsTracking(false)
    }
  }

  const [publicKey, setPublicKey] = useState<{ k: string; i: string } | null>(null)
  useEffect(() => {
    const loadKey = async () => {
      try {
        const keyResult = await getHandshakeKey()
        if ("error" in keyResult) return
        setPublicKey(keyResult)
      } catch { }
    }
    loadKey()
  }, [])

  async function encryptOnClient(plain: string): Promise<{ i: string; c: string }> {
    if (!publicKey) return { i: 'na', c: btoa(plain) }
    try {
      const enc = new TextEncoder().encode(plain)
      const der = Uint8Array.from(atob(publicKey.k), c => c.charCodeAt(0))
      const key = await window.crypto.subtle.importKey('spki', der.buffer, { name: 'RSA-OAEP', hash: 'SHA-256' }, false, ['encrypt'])
      const cipher = await window.crypto.subtle.encrypt({ name: 'RSA-OAEP' }, key, enc)
      return { i: publicKey.i, c: btoa(String.fromCharCode(...new Uint8Array(cipher))) }
    } catch {
      return { i: 'na', c: btoa(plain) }
    }
  }

  const statusBadgeClass = (status: string) => {
    if (status === "Delivered") return "bg-green-500/20 border-green-500/30 text-green-400"
    if (status === "Out for Delivery") return "bg-blue-500/20 border-blue-500/30 text-blue-400"
    if (status === "Customs Clearance") return "bg-yellow-500/20 border-yellow-500/30 text-yellow-400"
    return "bg-white/10 border-white/20 text-zinc-300"
  }

  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.2em] text-accent/80">{t.tools}</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1.5">
            <h1 className="text-3xl sm:text-4xl font-semibold text-foreground">{t.shipmentTracking}</h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Track your packages across carriers with detailed status updates.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="secondary">
              <Link href="/tools">{t.tools}</Link>
            </Button>
            <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href="/finds">{t.explore}</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-2 sm:px-4 lg:px-0 space-y-6">
        <div className="space-y-6">
          <Card className="relative overflow-hidden border border-foreground/10 bg-foreground/5 backdrop-blur-xl">
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-foreground/5 via-transparent to-background/10" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                {t.shipmentTracking}
              </CardTitle>
              <CardDescription>{t.trackYourPackages}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t.enterTrackingNumber}</label>
                  <Input
                    placeholder="e.g., JD014567890123456789"
                    value={trackingNumber}
                    onChange={(e) => { const v = e.target.value; setTrackingNumber(v); updateQuery('tracking', v) }}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !isTracking && trackingNumber.trim()) { e.preventDefault(); void trackPackage() } }}
                    className="bg-background/40 border-foreground/10 text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={() => trackPackage()}
                  disabled={!trackingNumber || isTracking}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {isTracking ? (
                    <>
                      <div className="w-4 h-4 border border-black/50 border-t-transparent rounded-full animate-spin mr-2" />
                      {t.tracking}
                    </>
                  ) : (
                    <>
                      <Truck className="w-4 h-4 mr-2" />
                      {t.track}
                    </>
                  )}
                </Button>
                {error && (
                  <div className="mt-2 text-sm text-red-300" role="status" aria-live="polite">
                    {error}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {savedTrackings.length > 0 && (
            <Card className="bg-foreground/5 border-foreground/10 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  {t.savedTrackings}
                </CardTitle>
                <CardDescription>Click to track again. Use the pencil to rename.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="divide-y divide-white/10">
                  {savedTrackings.map(item => (
                    <div key={item.id} className="flex items-center justify-between py-3 rounded-md hover:bg-white/5 transition-colors group">
                      <button
                        className="text-left flex-1 pr-3 cursor-pointer"
                        onClick={() => { setTrackingNumber(item.trackingNumber); trackPackage(item.trackingNumber) }}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium group-hover:text-white">{item.name || item.trackingNumber}</span>
                          {item.status && (
                            <span className="text-xs px-2 py-0.5 rounded bg-white/10 border border-white/10 text-zinc-300">{item.status}</span>
                          )}
                        </div>
                        <div className="text-xs text-zinc-400">{item.trackingNumber}</div>
                      </button>
                      <div className="flex items-center gap-2">
                        {editingId === item.id ? (
                          <>
                            <Input
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  setSavedTrackings(prev => prev.map(t => t.id === item.id ? { ...t, name: editingName } : t))
                                  setEditingId(null)
                                  setEditingName("")
                                }
                                if (e.key === 'Escape') {
                                  setEditingId(null)
                                  setEditingName("")
                                }
                              }}
                              className="h-8 bg-background/40 border-foreground/10 text-foreground"
                              autoFocus
                            />
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-white/80 hover:text-white"
                              onClick={() => {
                                setSavedTrackings(prev => prev.map(t => t.id === item.id ? { ...t, name: editingName } : t))
                                setEditingId(null)
                                setEditingName("")
                              }}
                              aria-label="Save name"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-white/80 hover:text-white"
                              onClick={() => { setEditingId(null); setEditingName("") }}
                              aria-label="Cancel rename"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-white/80 hover:text-white"
                            onClick={() => { setEditingId(item.id); setEditingName(item.name) }}
                            aria-label="Rename"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-white/80 hover:text-white"
                          onClick={() => setSavedTrackings(prev => prev.filter(t => t.id !== item.id))}
                          aria-label="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {events.length > 0 && (
            <Card className="bg-foreground/5 border-foreground/10 backdrop-blur-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-blue-400" />
                    Tracking Summary
                  </CardTitle>
                  <Badge className={statusBadgeClass(currentStatus)}>{currentStatus}</Badge>
                </div>
                <CardDescription>
                  ETA: {eta ? eta : "—"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                      <div className="flex items-center gap-2 text-zinc-300">
                        <Plane className="w-4 h-4" />
                        <span>Route</span>
                      </div>
                      <div className="mt-2 text-sm text-zinc-400">
                        Origin facility → Transit hub → Destination facility
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                      <div className="flex items-center gap-2 text-zinc-300">
                        <Clock className="w-4 h-4" />
                        <span>Estimated Delivery</span>
                      </div>
                      <div className="mt-2 text-sm text-zinc-400">{eta ? eta : "Pending"}</div>
                    </div>
                    <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                      <div className="flex items-center gap-2 text-zinc-300">
                        <MapPin className="w-4 h-4" />
                        <span>Last Location</span>
                      </div>
                      <div className="mt-2 text-sm text-zinc-400">{events[0]?.location}</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {events.map((evt, idx) => (
                      <div key={evt.id} className="flex items-start gap-3">
                        <div className={`mt-1 w-3 h-3 rounded-full ${idx === 0 ? "bg-primary" : "bg-muted"
                          }`} />
                        <div className="flex-1 p-4 rounded-lg border bg-foreground/5 border-foreground/10">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {evt.status === "Delivered" ? (
                                <CheckCircle className="w-4 h-4 text-green-400" />
                              ) : (
                                <Package className="w-4 h-4 text-zinc-300" />
                              )}
                              <span className="font-semibold">{evt.status}</span>
                            </div>
                            <span className="text-xs text-zinc-400">{evt.timestamp}</span>
                          </div>
                          <div className="mt-1 text-sm text-zinc-300">{evt.description}</div>
                          <div className="mt-1 text-xs text-zinc-400">{evt.location}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* FAQ Section */}
      <section className="relative z-10 max-w-3xl mx-auto px-6 lg:px-8 pb-20">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">
          {t.faqTitle}
        </h2>
        <Card className="bg-foreground/5 border-foreground/10 backdrop-blur-xl">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1" className="border-white/10">
              <AccordionTrigger className="px-6 hover:no-underline text-left">
                <span className="font-medium">{t.faq1Q}</span>
              </AccordionTrigger>
              <AccordionContent className="px-6 text-zinc-400">
                {t.faq1A}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2" className="border-white/10">
              <AccordionTrigger className="px-6 hover:no-underline text-left">
                <span className="font-medium">{t.faq2Q}</span>
              </AccordionTrigger>
              <AccordionContent className="px-6 text-zinc-400">
                {t.faq2A}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3" className="border-white/10">
              <AccordionTrigger className="px-6 hover:no-underline text-left">
                <span className="font-medium">{t.faq3Q}</span>
              </AccordionTrigger>
              <AccordionContent className="px-6 text-zinc-400">
                {t.faq3A}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Card>
      </section>

      {/* Bottom-of-page gradient next to the footer */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0">
        <div className="mx-auto w-[600px] md:w-[900px] h-[80px] bg-transparent blur-[100px] rounded-full" />
      </div>
    </div>
  )
}


