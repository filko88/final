import { Suspense } from "react"
import { getPageMetadata } from "@/lib/page-metadata"
import QcCheckerClient from "./QcCheckerClient"
import JsonLd from "@/components/JsonLd"

export const metadata = getPageMetadata("qcChecker")

// Structured data
const qcCheckerStructuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "QC Photo Checker",
  "description": "Free tool to view quality control photos from real purchases on Taobao, Weidian, and 1688",
  "url": "https://cnbabes.com/tools/qc-checker",
  "applicationCategory": "UtilityApplication",
  "operatingSystem": "Web Browser",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "featureList": [
    "View real QC photos from actual purchases",
    "Check product quality before buying",
    "Browse photos by product link",
    "See multiple angles and variations",
    "Free access to thousands of QC photos"
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
      "item": "https://cnbabes.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Tools",
      "item": "https://cnbabes.com/tools"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "QC Checker",
      "item": "https://cnbabes.com/tools/qc-checker"
    }
  ]
}

const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What are QC photos?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "QC (Quality Control) photos are detailed images taken of products before they're shipped. These photos help you verify the quality, authenticity, and condition of items before purchasing."
      }
    },
    {
      "@type": "Question",
      "name": "Where do the QC photos come from?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "We get qc photos from help of service named picks.ly."
      }
    },
    {
      "@type": "Question",
      "name": "How do I use the QC Checker?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Simply paste a product link from Taobao, Weidian, or 1688 into the search box. The tool will search our database and display all available QC photos for that product, organized by style and variation."
      }
    },
    {
      "@type": "Question",
      "name": "Is the QC Checker free?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, the QC Checker is completely free to use with no registration or payment required. You can search for and view as many QC photos as you need."
      }
    }
  ]
}

function QcCheckerLoadingSkeleton() {
  return (
    <div className="space-y-8 py-8">
      <div className="space-y-3">
        <div className="h-3 w-24 rounded-full bg-muted/20 animate-pulse" />
        <div className="h-8 w-48 rounded-lg bg-muted/20 animate-pulse" />
        <div className="h-4 w-72 rounded-lg bg-muted/20 animate-pulse" />
      </div>

      <div className="space-y-4">
        <div className="h-44 rounded-xl border border-border/40 bg-muted/10 animate-pulse" />
        <div className="h-64 rounded-xl border border-border/40 bg-muted/10 animate-pulse" />
        <div className="h-48 rounded-xl border border-border/40 bg-muted/10 animate-pulse" />
      </div>
    </div>
  )
}

export default function QcCheckerPage() {
  return (
    <>
      <JsonLd data={qcCheckerStructuredData} id="qc-checker-app" />
      <JsonLd data={breadcrumbStructuredData} id="qc-checker-breadcrumb" />
      <JsonLd data={faqStructuredData} id="qc-checker-faq" />
      <Suspense fallback={<QcCheckerLoadingSkeleton />}>
        <QcCheckerClient />
      </Suspense>
    </>
  )
} 