import type { Metadata } from "next"

export type PageMetadataKey =
  | "home"
  | "finds"
  | "findsItem"
  | "tools"
  | "links"
  | "tutorials"
  | "tutorialAcbuy"
  | "tutorialCnfans"
  | "tutorialKakobuy"
  | "tutorialOopbuy"
  | "legal"
  | "weightEstimator"
  | "qcChecker"
  | "linkPreview"
  | "linkConverter"
  | "shipmentTracking"
  | "archiveMostPopular"
  | "spreadsheet"

const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://acbuy-spreadsheet.xyz").replace(/\/$/, "")
const defaultOgImage = `${baseUrl}/images/repsheet-app.png`

export const globalKeywords = [
  "rep spreadsheet",
  "rep finds",
  "replica fashion",
  "best reps",
  "agent links",
  "qc photos",
  "acbuy-spreadsheet",
  "kakobuy",
  "cnfans",
  "acbuy",
  "oopbuy",
  "rep shopping tools",
]

type PageMetadataEntry = {
  title: string
  description: string
  path: string
  keywords?: string[]
}

const pageMetadata: Record<PageMetadataKey, PageMetadataEntry> = {
  home: {
    title: "acbuy-spreadsheet | Rep spreadsheet alternative for rep finds & QC photos",
    description:
      "Browse curated rep finds in a spreadsheet-style experience with QC photos, agent-ready links, and fast tools for replica fashion shoppers.",
    path: "/",
    keywords: ["rep spreadsheet alternative", "replica spreadsheet", "replica tools"],
  },
  finds: {
    title: "Rep Finds Browser | acbuy-spreadsheet rep spreadsheet with QC photos",
    description:
      "Search and filter rep finds with QC photos, batch notes, and agent links. Built for fast browsing and reliable replica sourcing.",
    path: "/finds",
    keywords: ["rep finds database", "replica finds", "rep finds spreadsheet"],
  },
  findsItem: {
    title: "Finds Item | acbuy-spreadsheet",
    description: "Detailed view for a rep find with batch notes, QC references, and agent links.",
    path: "/finds",
  },
  tools: {
    title: "Rep Tools Hub | acbuy-spreadsheet",
    description: "Link converter, QC checker, preview, tracking, and weight estimator in one hub.",
    path: "/tools",
    keywords: ["rep tools", "qc checker", "rep link converter"],
  },
  links: {
    title: "Links | acbuy-spreadsheet",
    description: "Quick links to the rep spreadsheet, agent resources, and buying utilities.",
    path: "/links",
  },
  tutorials: {
    title: "Tutorials | acbuy-spreadsheet",
    description: "Step-by-step buying guides for Kakobuy, CNFans, ACBuy, and OOPBuy.",
    path: "/tutorials",
  },
  tutorialAcbuy: {
    title: "How to Buy on ACBuy | acbuy-spreadsheet",
    description: "Step-by-step ACBuy guide for links, QC photos, and shipping lines.",
    path: "/tutorials/how-to-buy-on-acbuy",
  },
  tutorialCnfans: {
    title: "How to Buy on CNFans | acbuy-spreadsheet",
    description: "Step-by-step CNFans guide for links, QC photos, and shipping lines.",
    path: "/tutorials/how-to-buy-on-cnfans",
  },
  tutorialKakobuy: {
    title: "How to Buy on Kakobuy | acbuy-spreadsheet",
    description: "Step-by-step Kakobuy guide for links, QC photos, and shipping lines.",
    path: "/tutorials/how-to-buy-on-kakobuy",
  },
  tutorialOopbuy: {
    title: "How to Buy on OOPBuy | acbuy-spreadsheet",
    description: "Step-by-step OOPBuy guide for links, QC photos, and shipping lines.",
    path: "/tutorials/how-to-buy-on-oopbuy",
  },
  legal: {
    title: "Legal | acbuy-spreadsheet",
    description: "Disclaimer, privacy, and terms for acbuy-spreadsheet.",
    path: "/legal",
  },
  weightEstimator: {
    title: "Parcel Weight Estimator | acbuy-spreadsheet",
    description: "Estimate haul weight before shipping with item presets and packaging.",
    path: "/tools/weight-estimator",
  },
  qcChecker: {
    title: "QC Photo Checker | acbuy-spreadsheet",
    description: "View QC photos from real purchases before you buy.",
    path: "/tools/qc-checker",
  },
  linkPreview: {
    title: "Link Preview | acbuy-spreadsheet",
    description: "Preview product details from Taobao, Weidian, and 1688 before buying.",
    path: "/tools/link-preview",
  },
  linkConverter: {
    title: "Link Converter | acbuy-spreadsheet",
    description: "Convert Taobao, Weidian, and 1688 links for any shopping agent.",
    path: "/tools/link-converter",
  },
  shipmentTracking: {
    title: "Shipment Tracking | acbuy-spreadsheet",
    description: "Track packages across carriers with a simple status timeline.",
    path: "/tools/shippment-tracking",
  },
  archiveMostPopular: {
    title: "Most Popular | acbuy-spreadsheet",
    description: "Most viewed items. Scroll to load more.",
    path: "/most-popular",
  },
  spreadsheet: {
    title: "Rep Spreadsheet | Best replica finds, QC photos, and agent links",
    description:
      "Open the acbuy-spreadsheet of the best replica finds with QC photos, trusted agent links, and batch notes updated daily.",
    path: "/spreadsheet",
    keywords: ["rep spreadsheet download", "replica spreadsheet", "rep finds sheet"],
  },
}

export function getPageMetadata(key: PageMetadataKey): Metadata {
  const entry = pageMetadata[key]
  const url = `${baseUrl}${entry.path}`
  const keywords = Array.from(new Set([...(entry.keywords ?? []), ...globalKeywords]))

  return {
    title: entry.title,
    description: entry.description,
    keywords,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: entry.title,
      description: entry.description,
      url,
      siteName: "acbuy-spreadsheet",
      images: [
        {
          url: defaultOgImage,
          width: 1200,
          height: 630,
          alt: "acbuy-spreadsheet rep spreadsheet and rep finds",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: entry.title,
      description: entry.description,
      images: [defaultOgImage],
    },
  }
}

