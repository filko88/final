export function getPageDescription(pathname?: string) {
  if (!pathname) return "Explore best rep finds, QC photos, and tools."
  if (pathname === "/") return "Explore best rep finds, QC photos, and tools."
  if (pathname.startsWith("/finds")) return "Browse the latest rep finds with direct W2C links."
  if (pathname.startsWith("/tools")) return "QC checker, link converter, and shipping calculator."
  if (pathname.startsWith("/tutorials/how-to-buy-on-kakobuy")) return "How to buy on Kakobuy: steps, fees, QC, and shipping."
  if (pathname.startsWith("/tutorials/how-to-buy-on-cnfans")) return "How to buy on CNFans: steps, fees, QC, and shipping."
  if (pathname.startsWith("/tutorials/how-to-buy-on-acbuy")) return "How to buy on ACBuy: steps, fees, QC, and shipping."
  if (pathname.startsWith("/tutorials/how-to-buy-on-oopbuy")) return "How to buy on OOPBuy: steps, fees, QC, and shipping."
  if (pathname.startsWith("/tutorials")) return "Step-by-step agent buying tutorials and tips."
  if (pathname.startsWith("/legal")) return "Important disclaimers, privacy policy, and terms."
  return "Explore best rep finds, QC photos, and tools."
}


