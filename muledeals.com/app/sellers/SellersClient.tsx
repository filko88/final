"use client"

import { Button } from "@/components/ui/button"

interface Seller {
    id: string
    name: string
    description: string
    tags: string[] | null
    link: string
    image?: string
    avatar_url?: string | null
    banner_url?: string | null
}

interface SellersClientProps {
    initialSellers: Seller[]
}

export default function SellersClient({ initialSellers }: SellersClientProps) {
    return (
        <div className="min-h-screen bg-background text-foreground font-sans pb-20">
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.18),_transparent_55%)]" />
                <div className="absolute right-0 top-0 h-72 w-72 -translate-y-24 translate-x-16 rounded-full bg-gradient-to-br from-foreground/10 via-foreground/5 to-transparent blur-3xl" />
            </div>

            <div className="relative mx-auto w-full max-w-[1920px] px-4 pb-12 pt-6 sm:px-8 sm:pb-16 sm:pt-10">
                <section className="relative overflow-hidden mb-10 rounded-3xl border border-foreground/10 bg-background/70 p-6 sm:p-10 backdrop-blur-lg shadow-[0_18px_40px_-30px_rgba(15,23,42,0.6)]">
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-foreground/10 to-transparent" />
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <div className="space-y-3 max-w-xl">
                            <span className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-foreground/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                                Marketplace
                            </span>
                            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight">
                                Trusted sellers, curated for modern reps.
                            </h1>
                            <p className="text-base sm:text-lg text-muted-foreground">
                                Find shops with the best reputation, sharp product focus, and fast service.
                            </p>
                        </div>
                    </div>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {initialSellers.length === 0 ? (
                        <div className="col-span-full rounded-2xl border border-dashed border-foreground/20 bg-foreground/5 py-16 text-center text-muted-foreground">
                            No sellers available right now. Check back soon.
                        </div>
                    ) : (
                        initialSellers.map((seller, idx) => (
                            <article
                                key={`${seller.id}-${idx}`}
                                className="group relative overflow-hidden rounded-3xl border border-foreground/10 bg-background shadow transition-all duration-300 hover:-translate-y-1 hover:border-foreground/20 hover:shadow-md"
                            >
                                <div className="relative h-36">
                                    {seller.banner_url ? (
                                        <img
                                            src={seller.banner_url}
                                            alt={`${seller.name} banner`}
                                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="h-full w-full bg-gradient-to-r from-foreground/5 via-foreground/10 to-foreground/5" />
                                    )}
                                </div>

                                <div className="relative px-6 pb-6 pt-4">
                                    <div className="flex items-start gap-4">
                                        <div className="h-16 w-16 rounded-2xl bg-background/90 p-1 shadow-md ring-1 ring-foreground/10">
                                            <div className="h-full w-full overflow-hidden rounded-xl bg-foreground/5">
                                                {(seller.avatar_url || seller.image) ? (
                                                    <img
                                                        src={seller.avatar_url || seller.image || ""}
                                                        alt={seller.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center text-sm font-semibold text-muted-foreground">
                                                        {seller.name.substring(0, 2).toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center justify-between gap-3">
                                                <h3 className="text-lg font-semibold">{seller.name}</h3>
                                                <span className="rounded-full border border-foreground/10 bg-foreground/5 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                                                    Verified
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {seller.tags && seller.tags.slice(0, 4).map(tag => (
                                                    <span
                                                        key={tag}
                                                        className="rounded-full border border-foreground/10 bg-background px-3 py-1 text-[11px] font-medium text-muted-foreground"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <p className="mt-4 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                                        {seller.description}
                                    </p>

                                    <div className="mt-6 flex items-center gap-3">
                                        <Button
                                            className="h-10 rounded-xl bg-foreground text-background hover:bg-foreground/90"
                                            asChild
                                        >
                                            <a href={seller.link} target="_blank" rel="noopener noreferrer">Visit shop</a>
                                        </Button>
                                        <span className="text-xs text-muted-foreground">
                                            Updated recently
                                        </span>
                                    </div>
                                </div>
                            </article>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
