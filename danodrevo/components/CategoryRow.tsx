"use client"

import Link from "next/link"
import {
    Shirt,
    Footprints,
    Watch,
    ShoppingBag,
    Glasses,
    Sofa,
    Snowflake,
    Gem,
    CheckCircle,
    Music,
    Monitor
} from "lucide-react"

const PantsIcon = (props: React.ComponentProps<"svg">) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2h-4l-4-4-4 4H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <path d="M4 8h16" />
        <path d="M12 8v8" />
    </svg>
)

const categories = [
    { name: "Shoes", icon: Footprints, href: "/finds?category=shoes" },
    { name: "Tops", icon: Shirt, href: "/finds?category=tops" },
    { name: "Bottoms", icon: PantsIcon, href: "/finds?category=bottoms" },
    { name: "Jackets", icon: Snowflake, href: "/finds?category=jackets" },
    { name: "Accessories", icon: Watch, href: "/finds?category=accessories" },
    { name: "Decor", icon: Sofa, href: "/finds?category=decor" },
    { name: "Electronics", icon: Monitor, href: "/finds?category=electronics" },
]

export default function CategoryRow() {
    return (
        <div className="w-full overflow-x-auto scrollbar-hide py-2 mb-2">
            <div className="flex items-center gap-3 sm:gap-5 min-w-max mx-auto px-[-2px]">
                {categories.map((cat, idx) => (
                    <Link key={idx} href={cat.href} className="flex flex-col items-center gap-1.5 group min-w-[72px] cursor-pointer">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-secondary border border-border flex items-center justify-center shadow-sm transition-all group-hover:border-foreground/20 group-hover:bg-secondary/80">
                            <cat.icon className="w-7 h-7 sm:w-9 sm:h-9 text-foreground group-hover:text-foreground/80 transition-colors" />
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
