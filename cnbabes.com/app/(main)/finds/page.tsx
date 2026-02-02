import { Suspense } from "react"
import { getPageMetadata } from "@/lib/page-metadata"
import JsonLd from "@/components/JsonLd"
import FindsClient from "./FindsClient"
import { FindsSearch } from "@/components/FindsSearch"
import { safeFetchFinds, fetchCategories, type NormalizedFind } from "@/lib/finds-source"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

async function getProducts(): Promise<NormalizedFind[]> {
  return safeFetchFinds()
}

export const metadata = getPageMetadata("finds")
export const dynamic = 'force-dynamic'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL
const faqItems = [
  {
    question: "How do I find the best rep batches quickly?",
    answer:
      "Use the category pills and search bar to filter by brand, batch, or keyword. Open the spreadsheet to see additional tabs like “Best reps”, “QC photos”, and “Price drops” for annotated notes before you buy.",
  },
  {
    question: "Are QC photos included for every rep find?",
    answer:
      "Most listings have QC photo links or batch notes. When you need more detail, open the QC checker under Tools and paste the product link to fetch photos from recent buyers.",
  },
  {
    question: "Can I switch agents for a rep find?",
    answer:
      "Yes. Each item includes agent-ready links for Kakobuy, CNFans, ACBuy, and OOPBuy where available. You can also paste any link into the Link Converter tool to swap agents instantly.",
  },
  {
    question: "How fresh are the rep finds?",
    answer:
      "The finds list and the rep spreadsheet are refreshed daily. Dead links are removed, and high-performing batches with solid QC are highlighted as best sellers.",
  },
]

export default async function FindsPage({
  searchParams,
}: {
  searchParams?: { q?: string }
}) {
  const [initialProducts, categories] = await Promise.all([
    getProducts(),
    fetchCategories()
  ])
  const itemList = initialProducts.slice(0, 12).map((product, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: product.name,
    url: product.link,
  }))

  const pageStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "CNBabes Rep Spreadsheet",
    description:
      "Browse the best rep spreadsheet with latest rep finds and QC photos.",
    url: `${baseUrl}/finds`,
    isPartOf: {
      "@type": "WebSite",
      url: baseUrl,
      name: "CNBabes",
    },
  }

  const itemListStructuredData =
    itemList.length > 0
      ? {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "Best rep finds",
        description: "Most recent rep finds with QC photos and agent links",
        itemListOrder: "Descending",
        numberOfItems: itemList.length,
        itemListElement: itemList,
      }
      : null

  return (
    <div className="space-y-8">
      <JsonLd data={pageStructuredData} id="json-ld-finds-webpage" />
      {itemListStructuredData && <JsonLd data={itemListStructuredData} id="json-ld-finds-itemlist" />}

      <Suspense fallback={null}>
        <FindsClient
          key={searchParams?.q ?? "all"}
          initialProducts={initialProducts}
          categories={categories}
        />
      </Suspense>

      <section className="py-8 w-full max-w-[1920px] mx-auto px-4 sm:px-8">
        <h2 className="text-3xl font-bold text-foreground mb-6 text-center">Frequently Asked Questions</h2>
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqItems.map((item, index) => (
              <AccordionItem key={item.question} value={`item-${index}`} className="border border-border rounded-lg px-4 bg-card shadow-sm">
                <AccordionTrigger className="text-foreground hover:no-underline">{item.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </div>
  )
}