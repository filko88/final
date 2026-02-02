import { Suspense } from "react"
import { getPageMetadata } from "@/lib/page-metadata"
import LinkConverterClient from "./LinkConverterClient"
import JsonLd from "@/components/JsonLd"

export const metadata = getPageMetadata("linkConverter")

// Structured data for Link Converter tool
const linkConverterStructuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Link Converter",
  "description": "Best universal agent link converter for Kakobuy, Cnfans, Acbuy, Oopbuy and other agents.",
  "url": "https://acbuy-spreadsheet.xyz/tools/link-converter",
  "applicationCategory": "UtilityApplication",
  "operatingSystem": "Web Browser",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "featureList": [
    "Convert links from Taobao, Weidian, 1688",
    "Support for 15+ shopping agents",
    "Bulk conversion (multiple links at once)",
    "Instant results",
    "No registration required"
  ]
}

// Breadcrumb structured data
const breadcrumbStructuredData = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://acbuy-spreadsheet.xyz"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Tools",
      "item": "https://acbuy-spreadsheet.xyz/tools"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Link Converter",
      "item": "https://acbuy-spreadsheet.xyz/tools/link-converter"
    }
  ]
}

// How-To structured data
const howToStructuredData = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to Convert Product Links for Shopping Agents",
  "description": "Step-by-step guide to convert Taobao, Weidian, or 1688 links for use with shopping agents",
  "step": [
    {
      "@type": "HowToStep",
      "name": "Copy Product Link",
      "text": "Copy the product link from Taobao, Weidian, or 1688"
    },
    {
      "@type": "HowToStep",
      "name": "Paste Link",
      "text": "Paste the link into the converter input field (you can add multiple links, one per line)"
    },
    {
      "@type": "HowToStep",
      "name": "Convert",
      "text": "Click the 'Convert Links' button to generate agent-specific links"
    },
    {
      "@type": "HowToStep",
      "name": "Choose Agent",
      "text": "Click on your preferred agent button to open the converted link directly"
    }
  ]
}

// FAQ structured data
const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Which shopping agents does the link converter support?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The link converter supports all major shopping agents including Kakobuy, Cnfans, Acbuy, Oopbuy, Pandabuy, Superbuy, Wegobuy, MuleBuy, Basetao, OrientDig, SifuBuy, LoongBuy, Joyagoo, and more."
      }
    },
    {
      "@type": "Question",
      "name": "Which marketplaces can I convert links from?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "You can convert product links from Taobao, Weidian, 1688, and other major Chinese agents."
      }
    },
    {
      "@type": "Question",
      "name": "Can I convert multiple links at once?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes! Simply paste multiple product links into the input field, one link per line. The converter will process all of them simultaneously."
      }
    },
    {
      "@type": "Question",
      "name": "Is the link converter free to use?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, the link converter is completely free to use with no registration or payment required."
      }
    }
  ]
}

function LinkConverterLoadingSkeleton() {
  return (
    <div className="space-y-8 py-8">
      <div className="space-y-3">
        <div className="h-3 w-24 rounded-full bg-muted/20 animate-pulse" />
        <div className="h-8 w-48 rounded-lg bg-muted/20 animate-pulse" />
        <div className="h-4 w-72 rounded-lg bg-muted/20 animate-pulse" />
      </div>

      <div className="space-y-4">
        <div className="h-36 rounded-xl border border-border/40 bg-muted/10 animate-pulse" />
        <div className="h-56 rounded-xl border border-border/40 bg-muted/10 animate-pulse" />
        <div className="h-48 rounded-xl border border-border/40 bg-muted/10 animate-pulse" />
      </div>
    </div>
  )
}

export default function LinkConverterPage() {
  return (
    <>
      <JsonLd data={linkConverterStructuredData} id="link-converter-app" />
      <JsonLd data={breadcrumbStructuredData} id="link-converter-breadcrumb" />
      <JsonLd data={howToStructuredData} id="link-converter-howto" />
      <JsonLd data={faqStructuredData} id="link-converter-faq" />
      <Suspense fallback={<LinkConverterLoadingSkeleton />}>
        <LinkConverterClient />
      </Suspense>
    </>
  )
} 