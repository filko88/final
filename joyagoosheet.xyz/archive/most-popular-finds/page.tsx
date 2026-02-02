import { Metadata } from "next"
import { getPageMetadata } from "@/lib/page-metadata"
import MostPopularClient from "./MostPopularClient"

export const metadata: Metadata = getPageMetadata("archiveMostPopular")

export default function MostPopularFindsPage() {
  return <MostPopularClient />
}


