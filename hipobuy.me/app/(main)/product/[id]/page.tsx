import { notFound } from "next/navigation"
import { fetchFindsFromDatabase } from "@/lib/finds-source"
import ProductClient from "./ProductClient"

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function ProductPage({ params }: PageProps) {
    const { id } = await params

    // Convert ID string to number for lookup
    const productId = Number.parseInt(id, 10)

    if (Number.isNaN(productId)) {
        notFound()
    }

    // Fetch all items (in a real app, you'd fetch one by ID)
    // For now, using the static DB helper
    const allItems = await fetchFindsFromDatabase()
    const product = allItems.find(p => p._id === productId)

    if (!product) {
        notFound()
    }

    return <ProductClient product={product} />
}
