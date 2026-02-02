import { notFound } from "next/navigation"
import { getPageMetadata } from "@/lib/page-metadata"

export const metadata = getPageMetadata("shipmentTracking")

// Structured data
const trackingStructuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Shipment Tracking Tool",
  "description": "Free tool to track packages across multiple carriers with detailed timeline and status updates",
  "url": "https://rep-finds.com/tools/shippment-tracking",
  "applicationCategory": "UtilityApplication",
  "operatingSystem": "Web Browser",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "featureList": [
    "Track packages from multiple carriers",
    "View detailed tracking timeline",
    "Get ETA estimates",
    "See carrier information",
    "Save tracking numbers for quick access",
    "Real-time status updates"
  ]
}

const breadcrumbStructuredData = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://rep-finds.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Tools",
      "item": "https://rep-finds.com/tools"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Shipment Tracking",
      "item": "https://rep-finds.com/tools/shippment-tracking"
    }
  ]
}

const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Which carriers does the tracking tool support?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The tracking tool supports all major carriers including DHL, FedEx, UPS, EMS, China Post, SF Express, YunExpress, and many more. Simply enter your tracking number and the tool will automatically detect the carrier."
      }
    },
    {
      "@type": "Question",
      "name": "How do I track my package?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Simply paste your tracking number into the input field and click 'Track'. The tool will search for your package and display a detailed timeline of its journey, current status, and estimated delivery date."
      }
    },
    {
      "@type": "Question",
      "name": "Can I save tracking numbers for later?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes! The tool automatically saves your tracking numbers locally in your browser. You can easily access and track them again later, and even rename them for better organization."
      }
    },
    {
      "@type": "Question",
      "name": "Is the shipment tracking tool free?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, the shipment tracking tool is completely free to use with no registration or payment required."
      }
    }
  ]
}

function TrackingLoadingSkeleton() {
  return (
    <div className="space-y-8 py-8">
      <div className="space-y-3">
        <div className="h-3 w-24 rounded-full bg-muted/20 animate-pulse" />
        <div className="h-8 w-48 rounded-lg bg-muted/20 animate-pulse" />
        <div className="h-4 w-72 rounded-lg bg-muted/20 animate-pulse" />
      </div>

      <div className="space-y-4">
        <div className="h-28 rounded-xl border border-border/40 bg-muted/10 animate-pulse" />
        <div className="h-64 rounded-xl border border-border/40 bg-muted/10 animate-pulse" />
        <div className="h-40 rounded-xl border border-border/40 bg-muted/10 animate-pulse" />
      </div>
    </div>
  )
}

export default function ShippmentTrackingPage() {
  notFound()
}


