import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import StarBorder from "@/components/ui/star-border"
import CategoryRow from "@/components/CategoryRow"
import HomeCarouselsSection from "@/components/home/HomeCarouselsSection"
import HomeCarouselsSkeleton from "@/components/home/HomeCarouselsSkeleton"
import HomeSearchClient from "@/components/home/HomeSearchClient"
import { Info, ArrowUpRight, Camera, MessageSquareQuote, Search } from "lucide-react"

export default function Home() {

  const t = {
    announcement: "The rep helper extension V2 has just dropped",
    announcementMobile: "The rep helper extension V2 has just dropped",
    heroTitle: "Find more.\nFaster and better.",
    browseFinds: "Browse Rep Spreadsheet",
    faqTitle: "Frequently Asked Questions",
    linkUtilityTool: "Link Utility Tool",
    linkUtilityDescription: "View QC photos, get product details, and convert links to agents like Acbuy, CNFans, Kakobuy, and Oopbuy."
  }

  const utilitySectionStars = [
    // Original stars
    { src: "/images/link-utility/star.png", left: "82px", top: "255px", w: 12, h: 12, o: "opacity-100" },
    { src: "/images/link-utility/star1.png", left: "228px", top: "102px", w: 24, h: 24, o: "opacity-100" },
    { src: "/images/link-utility/star2.png", left: "1232px", top: "102px", w: 20, h: 20, o: "opacity-100" },
    { src: "/images/link-utility/star.png", left: "92%", top: "50%", w: 12, h: 12, o: "opacity-60" },
    { src: "/images/link-utility/star1.png", left: "25%", top: "80%", w: 8, h: 8, o: "opacity-70" },
    { src: "/images/link-utility/star2.png", left: "80%", top: "85%", w: 16, h: 16, o: "opacity-100" },
    // A few extra stars
    { src: "/images/link-utility/star.png", left: "10%", top: "40%", w: 6, h: 6, o: "opacity-30" },
    { src: "/images/link-utility/star2.png", left: "70%", top: "20%", w: 8, h: 8, o: "opacity-40" },
  ]
  const faqItems = [
    {
      question: "What is acbuy-spreadsheet?",
      answer: "acbuy-spreadsheet is the best rep spreadsheet alternative. It's a tool that helps you not only find the best rep finds but also check the QC photos from top agents like Acbuy, CNFans, Kakobuy, and Oopbuy.",
    },
    {
      question: "Why did we create acbuy-spreadsheet?",
      answer: "We created acbuy-spreadsheet because we were tired of manually searching for the best rep finds and checking the QC photos. We wanted to create a tool that would help you find the best rep finds and check the QC photos from top agents like Acbuy, CNFans, Kakobuy, and Oopbuy.",
    },
    {
      question: "Which agents and platforms does acbuy-spreadsheet support?",
      answer: "acbuy-spreadsheet currently supports 4 agents: Acbuy, CNFans, Kakobuy, and Oopbuy. We think that's enough for now. If you want to see more agents, please let us know.",
    },
  ]

  const featureCards = [
    {
      title: "Product info",
      description: "Read information about the product before you buy it.",
      icon: <Info className="w-6 h-6 text-foreground/75" />,
    },
    {
      title: "QC Checker",
      description: "Check if your product has QC photos available.",
      icon: <Camera className="w-6 h-6 text-foreground/75" />,
    },
    {
      title: "Link Converter",
      description: "Turn any product link into your preferred agent link — Acbuy, CNFans, Kakobuy, Oopbuy.",
      icon: <MessageSquareQuote className="w-6 h-6 text-foreground/75" />,
    },
  ]

  return (
    <div className="bg-background text-foreground font-sans overflow-x-hidden min-h-screen" suppressHydrationWarning={true}>
      <div className="relative overflow-visible">
        {/* Background Elements */}

        {/* Hero Content */}
        <div className="relative z-10 pt-8 sm:pt-16">
          <main className="w-full max-w-[1920px] mx-auto px-4 sm:px-8 relative">
            {/* Announcement - Removed */}

            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-foreground leading-[0.9] tracking-tighter mb-8">
              {t.heroTitle}
            </h1>

            {/* Search Bar */}
            <HomeSearchClient />

            {/* Category Row */}
            <CategoryRow />
          </main>
        </div>
      </div>

      <div className="mx-auto relative z-10 mt-0">
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-8 space-y-2 sm:space-y-3">
          <Suspense fallback={<HomeCarouselsSkeleton />}>
            <HomeCarouselsSection />
          </Suspense>
        </div>
      </div>

      <div className="mt-8 mb-0 w-full">
        <div className="border border-foreground/10 bg-background/70 px-5 py-6">
          <div className="grid gap-6 sm:grid-cols-3 text-center">
            <div className="space-y-1">
              <div className="text-3xl font-semibold text-foreground">∞</div>
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Curated finds</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-semibold text-foreground">20+</div>
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Agents supported</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-semibold text-foreground">Daily</div>
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Updated daily</div>
            </div>
          </div>
        </div>
      </div>

      {/* Link Utility Section */}
      <section className="relative flex flex-col items-center justify-center pt-0 pb-12 overflow-hidden w-full bg-background">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.18),_transparent_55%)]" />
        <div className="absolute -right-16 top-10 h-40 w-40 rounded-full bg-gradient-to-br from-foreground/10 via-foreground/5 to-transparent blur-3xl" />
        {utilitySectionStars.map((star, i) => (
          <img
            key={i}
            src={star.src}
            alt=""
            className={`absolute pointer-events-none ${star.o}`}
            style={{
              left: star.left,
              top: star.top,
              width: star.w,
              height: star.h,
              filter: "hue-rotate(210deg) saturate(140%) brightness(0.7)",
            }}
            loading="lazy"
          />
        ))}

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <h2 className="mt-16 text-4xl md:text-5xl font-bold text-foreground mb-4">
            <span className="text-foreground">Link Utility Tool</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8 text-lg">
            {t.linkUtilityDescription}
          </p>

          <div className="grid md:grid-cols-3 gap-6 text-left">
            {featureCards.map((card, i) => (
              <div
                key={i}
                className="group relative overflow-hidden rounded-2xl border border-foreground/10 bg-background/70 p-6 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.7)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_25px_60px_-35px_rgba(15,23,42,0.7)]"
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-foreground/40 via-foreground/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="w-12 h-12 rounded-full bg-secondary/60 flex items-center justify-center mb-4 border border-border">
                  <div className="text-foreground">
                    {card.icon}
                  </div>
                </div>
                <h3 className="text-foreground text-xl font-bold mb-2">{card.title}</h3>
                <p className="text-muted-foreground">{card.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <StarBorder as="div" className="rounded-full">
              <Button asChild size="lg" className="rounded-full px-6 text-base font-medium shadow-lg hover:shadow-xl transition-all">
                <Link href="/tools/link-converter">
                  Try Link Converter
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </StarBorder>
            <Button asChild variant="outline" size="lg" className="rounded-full px-6 text-base">
              <Link href="/tools">
                Explore tools
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative py-10 w-full max-w-[1920px] mx-auto px-4 sm:px-8 bg-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(148,163,184,0.12),_transparent_60%)]" />
        <div className="max-w-4xl mx-auto text-center mb-12 relative">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">How acbuy-spreadsheet Works</h2>
          <p className="text-muted-foreground text-lg">A simple process to help you shop internationally with ease</p>
        </div>

        <div className="max-w-4xl mx-auto relative">
          <div className="relative pb-12">
            <div className="space-y-6 md:space-y-12">
              {/* Step 1 */}
              <div className="relative flex flex-col md:flex-row items-start">
                <div className="w-full md:w-1/2 pl-12 md:pl-0 md:pr-16 md:text-right order-2 md:order-1">
                  <div className="rounded-2xl border border-foreground/10 bg-background/80 p-5 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.6)]">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground mb-2 md:justify-end">
                      <Search className="h-4 w-4" />
                      <span>Discover</span>
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-1">Find Products</h3>
                    <p className="text-muted-foreground text-sm sm:text-base">Browse our curated product database or use the lookup tool to research items from global marketplaces.</p>
                  </div>
                </div>
                <div className="absolute left-0 md:left-1/2 top-0 -translate-x-0 md:-translate-x-1/2 flex items-center justify-center w-11 h-11 rounded-full bg-primary text-primary-foreground font-bold text-sm shadow-lg z-10 order-1">
                  01
                </div>
                <div className="absolute left-[21px] md:left-1/2 top-6 w-[2px] bg-border md:-translate-x-1/2 z-0 h-[calc(100%+1.5rem)] md:h-[calc(100%+3rem)]" />
                <div className="hidden md:block w-1/2 order-3" />
              </div>

              {/* Step 2 */}
              <div className="relative flex flex-col md:flex-row items-start">
                <div className="hidden md:block w-1/2 order-1" />
                <div className="absolute left-0 md:left-1/2 top-0 -translate-x-0 md:-translate-x-1/2 flex items-center justify-center w-11 h-11 rounded-full bg-background border-2 border-primary text-foreground font-bold text-sm shadow-sm z-10 order-1">
                  02
                </div>
                <div className="absolute left-[21px] md:left-1/2 top-6 w-[2px] bg-border md:-translate-x-1/2 z-0 h-[calc(100%+1.5rem)] md:h-[calc(100%+3rem)]" />
                <div className="w-full md:w-1/2 pl-12 md:pl-16 md:text-left order-2">
                  <div className="rounded-2xl border border-foreground/10 bg-background/80 p-5 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.6)]">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground mb-2">
                      <MessageSquareQuote className="h-4 w-4" />
                      <span>Convert</span>
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-1">Convert Links</h3>
                    <p className="text-muted-foreground text-sm sm:text-base">Use our link converter to transform marketplace links into formats you can easily use and share.</p>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative flex flex-col md:flex-row items-start">
                <div className="w-full md:w-1/2 pl-12 md:pl-0 md:pr-16 md:text-right order-2 md:order-1">
                  <div className="rounded-2xl border border-foreground/10 bg-background/80 p-5 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.6)]">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground mb-2 md:justify-end">
                      <ArrowUpRight className="h-4 w-4" />
                      <span>Order</span>
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-1">Place Orders</h3>
                    <p className="text-muted-foreground text-sm sm:text-base">Follow our guides to safely place orders on international platforms with confidence.</p>
                  </div>
                </div>
                <div className="absolute left-0 md:left-1/2 top-0 -translate-x-0 md:-translate-x-1/2 flex items-center justify-center w-11 h-11 rounded-full bg-primary text-primary-foreground font-bold text-sm shadow-lg z-10 order-1">
                  03
                </div>
                <div className="absolute left-[21px] md:left-1/2 top-6 w-[2px] bg-border md:-translate-x-1/2 z-0 h-[calc(100%+1.5rem)] md:h-[calc(100%+3rem)]" />
                <div className="hidden md:block w-1/2 order-3" />
              </div>

              {/* Step 4 */}
              <div className="relative flex flex-col md:flex-row items-start">
                <div className="hidden md:block w-1/2 order-1" />
                <div className="absolute left-0 md:left-1/2 top-0 -translate-x-0 md:-translate-x-1/2 flex items-center justify-center w-11 h-11 rounded-full bg-background border-2 border-primary text-foreground font-bold text-sm shadow-sm z-10 order-1">
                  04
                </div>
                <div className="w-full md:w-1/2 pl-12 md:pl-16 md:text-left order-2">
                  <div className="rounded-2xl border border-foreground/10 bg-background/80 p-5 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.6)]">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground mb-2">
                      <Info className="h-4 w-4" />
                      <span>Track</span>
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-1">Track Shipments</h3>
                    <p className="text-muted-foreground text-sm sm:text-base">Monitor your packages in real-time across multiple carriers until they arrive at your doorstep.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-2 text-center">
            <Button asChild size="lg" className="rounded-full px-8 text-lg font-medium shadow-lg hover:shadow-xl transition-all">
              <Link href="/tutorials">
                View Detailed Tutorials
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-8 w-full max-w-[1920px] mx-auto px-4 sm:px-8">
        <h2 className="text-3xl font-bold text-foreground mb-6 text-center">{t.faqTitle}</h2>
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqItems.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border border-border rounded-lg px-4 bg-card shadow-sm">
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
