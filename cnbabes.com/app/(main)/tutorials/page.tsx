import { getPageMetadata } from "@/lib/page-metadata"
import TutorialsClient from "./TutorialsClient"

export const metadata = getPageMetadata("tutorials")

export default function TutorialsPage() {
  return <TutorialsClient />
}

