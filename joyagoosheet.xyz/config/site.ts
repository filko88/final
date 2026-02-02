export type SiteTheme = {
  accent: string
  radius: number
  cardBlur: string
  cardOpacity: number
}

export type ProductsPageConfig = {
  showFilters: boolean
  showBadges: boolean
  gridColumns: number
}

export type SiteConfig = {
  siteName: string
  siteDescription: string
  theme: SiteTheme
  productsPage: ProductsPageConfig
}

export const siteConfig: SiteConfig = {
  siteName: "Rep-Finds",
  siteDescription: "Rep-Finds surfaces the best rep finds, tools, and tutorials to make buying smoother.",
  theme: {
    accent: "#F97084",
    radius: 12,
    cardBlur: "16px",
    cardOpacity: 0.4,
  },
  productsPage: {
    showFilters: true,
    showBadges: true,
    gridColumns: 3,
  },
}

