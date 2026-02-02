export interface NavLink {
  href: string
  label: string
  prefetch?: boolean
}

export const navLinks: NavLink[] = [
  { href: "/finds", label: "Finds", prefetch: true },
  { href: "/sellers", label: "Sellers", prefetch: true },
  { href: "/tools", label: "Tools", prefetch: true },
  { href: "/tutorials", label: "Tutorials", prefetch: true },
]

export const getNavLabel = (label: string) => label


