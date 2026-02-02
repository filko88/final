"use client"

import Link from "next/link"
import Image from "next/image"

const categories = [
    { name: "Shoes", image: "/images/girls-categories/shoes.png", href: "/finds?category=shoes" },
    { name: "Tops", image: "/images/girls-categories/tops.png", href: "/finds?category=tops" },
    { name: "Bottoms", image: "/images/girls-categories/bottoms.png", href: "/finds?category=bottoms" },
    { name: "Jackets", image: "/images/girls-categories/jackets.png", href: "/finds?category=jackets" },
    { name: "Accessories", image: "/images/girls-categories/accessories.png", href: "/finds?category=accessories" },
    { name: "Decor", image: "/images/girls-categories/decor.png", href: "/finds?category=decor" },
    { name: "Electronics", image: "/images/girls-categories/electronics.png", href: "/finds?category=electronics" },
]

export default function CategoryRow() {
    return (
        <div className="w-full overflow-x-auto scrollbar-hide py-2 mb-2">
            <div className="flex items-center gap-3 sm:gap-5 min-w-max mx-auto px-[-2px]">
                {categories.map((cat, idx) => (
                    <Link key={idx} href={cat.href} className="flex flex-col items-center gap-1.5 group min-w-[72px] cursor-pointer">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-secondary border border-border flex items-center justify-center shadow-sm transition-all group-hover:border-foreground/20 group-hover:bg-secondary/80">
                            <Image
                                src={cat.image}
                                alt={cat.name}
                                width={48}
                                height={48}
                                className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                            />
                        </div>
                        <span className="text-xs sm:text-sm text-foreground font-medium group-hover:text-muted-foreground transition-colors whitespace-nowrap">
                            {cat.name}
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    )
}
