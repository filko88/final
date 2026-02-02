"use client"

import { useEffect, useState } from "react"
import ProductsClient from "./ProductsClient"
import type { NormalizedFind } from "@/lib/finds-source"

interface ProductsClientWrapperProps {
    items: NormalizedFind[]
    userEmail?: string
    permissions?: {
        canAdd?: boolean | null
        canEdit?: boolean | null
        canRemove?: boolean | null
        scopeFinds?: boolean | null
        scopeGirls?: boolean | null
    }
}

export default function ProductsClientWrapper({ items, userEmail, permissions }: ProductsClientWrapperProps) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    const normalizedPermissions = permissions ? {
        canAdd: permissions.canAdd ?? undefined,
        canEdit: permissions.canEdit ?? undefined,
        canRemove: permissions.canRemove ?? undefined,
        scopeFinds: permissions.scopeFinds ?? undefined,
        scopeGirls: permissions.scopeGirls ?? undefined,
    } : undefined

    return <ProductsClient items={items} userEmail={userEmail} permissions={normalizedPermissions} />
}
