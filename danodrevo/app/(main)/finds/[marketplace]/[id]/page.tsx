import { notFound } from "next/navigation"
import { getPageMetadata } from "@/lib/page-metadata"

export const metadata = getPageMetadata("findsItem")

export default function ItemDetailsPage() {
  notFound()
}

