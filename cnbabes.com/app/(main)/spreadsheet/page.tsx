import Link from "next/link"
import { ArrowRight, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import JsonLd from "@/components/JsonLd"
import { getPageMetadata, globalKeywords } from "@/lib/page-metadata"

export const metadata = getPageMetadata("spreadsheet")

const SHEET_URL =
  "https://cnbabes.com"
const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://cnbabes.com").replace(/\/$/, "")
const pageUrl = `${baseUrl}/spreadsheet`

const faq = [
  {
    question: "What is this rep spreadsheet?",
    answer:
      "It is a living spreadsheet of vetted replica fashion finds with QC photos, batch notes, sizing comments, and agent-ready links so you can purchase faster.",
  },
  {
    question: "How often is the spreadsheet updated?",
    answer: "New rep finds are reviewed and added daily, with stale or low-quality links pruned to keep the sheet clean.",
  },
  {
    question: "Can I search by category or brand?",
    answer:
      "Yes. Use the filters in the sheet tabs and the dedicated /finds page to search by brand, category, batch, or keyword.",
  },
  {
    question: "How do I check QC photos before buying?",
    answer:
      "Open the QC column in the spreadsheet or use the free QC Checker under Tools. We link directly to photo sets when available.",
  },
]

export default function RepSpreadsheetPage() {
  const datasetStructuredData = {
    "@context": "https://schema.org",
    "@type": ["Dataset", "Table"],
    name: "CNBabes Rep Spreadsheet",
    description:
      "Curated rep spreadsheet with replica fashion finds, QC photos, batch notes, and trusted agent links updated daily.",
    url: pageUrl,
    creator: {
      "@type": "Organization",
      name: "CNBabes",
      url: baseUrl,
    },
    keywords: globalKeywords,
    distribution: [
      {
        "@type": "DataDownload",
        name: "CNBabes Google Sheets view",
        contentUrl: SHEET_URL,
        encodingFormat: "text/html",
      },
    ],
    license: "https://creativecommons.org/licenses/by/4.0/",
    isBasedOn: `${baseUrl}/finds`,
  }

  const webPageStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Rep Spreadsheet by CNBabes",
    description:
      "The best rep spreadsheet to find replica fashion links, QC photos, and batch notes with agent-ready buys.",
    url: pageUrl,
    isPartOf: {
      "@type": "WebSite",
      name: "CNBabes",
      url: baseUrl,
    },
    mainEntity: datasetStructuredData,
  }

  return (
    <div className="space-y-10">
      <JsonLd data={datasetStructuredData} id="json-ld-rep-spreadsheet" />
      <JsonLd data={webPageStructuredData} id="json-ld-rep-spreadsheet-webpage" />

      <section className="space-y-4 rounded-2xl border border-foreground/10 bg-foreground/5 p-6 shadow-sm">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Rep Spreadsheet</p>
        <h1 className="text-3xl sm:text-4xl font-semibold text-foreground">
          Rep spreadsheet for the best replica finds, QC photos, and agent links
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed">
          Skip dead links. This rep spreadsheet is updated daily with vetted replica fashion finds, QC photos, batch
          notes, and agent-ready purchase links. It is built to outperform static rep finds lists with long-tail filters
          and clear sourcing context.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href={SHEET_URL} target="_blank" rel="noopener noreferrer">
              Open the rep spreadsheet
              <ExternalLink className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="secondary" asChild size="lg">
            <Link href="/finds">
              Browse rep finds
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Need more context? Use the internal <Link href="/finds" className="underline">rep finds browser</Link> for
          faster search, or jump into the <Link href="/tools/qc-checker" className="underline">QC checker</Link> to
          validate photos before buying.
        </p>
      </section>

      <section className="grid gap-6 rounded-2xl border border-foreground/10 bg-background/60 p-6 md:grid-cols-2">
        <div className="space-y-3">
          <h2 className="text-2xl font-semibold text-foreground">Why this beats static rep lists</h2>
          <ul className="space-y-2 text-muted-foreground">
            <li>• Spreadsheet layout with tabs for categories, batches, QC photos, and price history.</li>
            <li>• Long-tail keywords baked into each row for faster discovery (brands, styles, sizing notes).</li>
            <li>• Agent-ready links for Kakobuy, CNFans, ACBuy, and OOPBuy to reduce cart time.</li>
            <li>• Daily freshness checks that remove dead or low-quality rep finds automatically.</li>
          </ul>
        </div>
        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-foreground">How to use the rep spreadsheet</h3>
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
            <li>Open the sheet and filter by brand, category, or batch quality to surface best reps.</li>
            <li>Review the QC column and batch notes to confirm stitching, shape, and materials.</li>
            <li>Click the agent link you prefer; pricing automatically maps to Kakobuy, CNFans, ACBuy, or OOPBuy.</li>
            <li>Save finds to your cart and rerun QC with the free checker before placing the order.</li>
          </ol>
          <p className="text-sm text-muted-foreground">
            Prefer a visual grid? The <Link href="/finds" className="underline">rep finds page</Link> mirrors the same
            spreadsheet data with image previews and infinite scroll.
          </p>
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-foreground/10 bg-foreground/5 p-6">
        <h2 className="text-2xl font-semibold text-foreground">Rep spreadsheet FAQ</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {faq.map((item) => (
            <details
              key={item.question}
              className="rounded-xl border border-foreground/10 bg-background/50 p-4 shadow-sm"
            >
              <summary className="cursor-pointer text-base font-semibold text-foreground">{item.question}</summary>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-foreground/10 bg-background/60 p-6">
        <h2 className="text-xl font-semibold text-foreground">More rep spreadsheet resources</h2>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" asChild>
            <Link href="/tools" prefetch>
              Explore free rep tools
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/tutorials" prefetch>
              Buying tutorials for agents
            </Link>
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Built to rank for long-tail queries like “rep spreadsheet with qc photos”, “best replica sheet”, and “agent
          links spreadsheet”. Save the sheet and check back often for fresh drops.
        </p>
      </section>
    </div>
  )
}

