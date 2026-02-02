import { getPageMetadata } from "@/lib/page-metadata"
import ToolsClient from "./ToolsClient"

export const metadata = getPageMetadata("tools")

export default function ToolsPage() {
  return <ToolsClient />
}
