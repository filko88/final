"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/utils/supabase/client"
import ItemForm from "@/components/admin/ItemForm"
import type { NormalizedFind } from "@/lib/finds-source"
import { LogOut, Trash2, Pencil, Search, ShieldCheck, ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react"
import { toast } from "sonner"
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from "lucide-react"

interface ProductsClientProps {
    items: NormalizedFind[]
    userEmail?: string
    permissions?: {
        canAdd?: boolean
        canEdit?: boolean
        canRemove?: boolean
        scopeFinds?: boolean
        scopeGirls?: boolean
    }
}

export default function ProductsClient({ items: initialItems, userEmail, permissions }: ProductsClientProps) {
    const router = useRouter()
    const supabase = createClient()
    const [search, setSearch] = useState("")
    const [items, setItems] = useState(initialItems)
    const [sortColumn, setSortColumn] = useState<'name' | 'brand' | 'price' | 'category' | 'status' | null>(null)
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
    const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'boosted'>('all')
    const searchParams = useSearchParams()
    const statusParam = searchParams.get("status")

    // Sync local state when server data changes.
    useEffect(() => {
        setItems(initialItems)
    }, [initialItems])

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            setItems((items) => {
                const oldIndex = items.findIndex((item) => item._id === active.id);
                const newIndex = items.findIndex((item) => item._id === over?.id);

                const newItems = arrayMove(items, oldIndex, newIndex);

                // Update sort_order for all affected items
                // Strategy: assign sort_order = index
                const updates = newItems.map((item, index) => ({
                    id: item._id, // use _id
                    sort_order: index
                }));

                // Persist order to backend
                // This updates all items. For large lists this is heavy, but for typical "finds" list it's okay.
                // We can optimize to only update affected range later.
                const updateOrder = async () => {
                    for (const update of updates) {
                        await supabase.from('finds').update({ sort_order: update.sort_order }).eq('id', update.id)
                    }
                    toast.success("Order updated")
                    router.refresh()
                }
                updateOrder()

                return newItems;
            });
        }
    }

    // Check permissions
    const inScope = !!permissions?.scopeFinds
    const canAdd = inScope && !!permissions?.canAdd
    const canEdit = inScope && !!permissions?.canEdit
    const canRemove = inScope && !!permissions?.canRemove

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this item?")) return

        const { error } = await supabase.from("finds").delete().eq("id", id)
        if (error) {
            toast.error("Failed to delete", { description: error.message })
        } else {
            toast.success("Item deleted")
            setItems(items.filter(i => i._id !== id)) // Optimistic update
            router.refresh()
        }
    }

    const handleSort = (column: 'name' | 'brand' | 'price' | 'category' | 'status') => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
        } else {
            setSortColumn(column)
            setSortDirection('asc')
        }
    }

    const SortIcon = ({ column }: { column: typeof sortColumn }) => {
        if (sortColumn !== column) return <ChevronsUpDown className="h-3 w-3 ml-1 inline" />
        return sortDirection === 'asc' ?
            <ChevronUp className="h-3 w-3 ml-1 inline" /> :
            <ChevronDown className="h-3 w-3 ml-1 inline" />
    }

    let filteredItems = items.filter(i =>
        i.name.toLowerCase().includes(search.toLowerCase()) ||
        i.brand.toLowerCase().includes(search.toLowerCase())
    )

    useEffect(() => {
        if (statusParam === "draft" || statusParam === "published" || statusParam === "boosted" || statusParam === "all") {
            setStatusFilter(statusParam)
        } else if (!statusParam) {
            setStatusFilter("all")
        }
    }, [statusParam])

    const setStatusAndUrl = (next: 'all' | 'published' | 'draft' | 'boosted') => {
        setStatusFilter(next)
        if (next === "all") {
            router.replace("/admin/products")
        } else {
            router.replace(`/admin/products?status=${next}`)
        }
    }

    // Apply status filter
    if (statusFilter === 'published') {
        filteredItems = filteredItems.filter(i => i.status === 'published')
    } else if (statusFilter === 'draft') {
        filteredItems = filteredItems.filter(i => i.status === 'draft')
    } else if (statusFilter === 'boosted') {
        filteredItems = filteredItems.filter(i => i.boost_order && i.boost_order > 0)
    }

    // Apply sorting
    if (sortColumn) {
        filteredItems = [...filteredItems].sort((a, b) => {
            let aVal: any, bVal: any

            if (sortColumn === 'name') {
                aVal = a.name.toLowerCase()
                bVal = b.name.toLowerCase()
            } else if (sortColumn === 'brand') {
                aVal = a.brand.toLowerCase()
                bVal = b.brand.toLowerCase()
            } else if (sortColumn === 'price') {
                aVal = a.price
                bVal = b.price
            } else if (sortColumn === 'category') {
                aVal = a["category[0]"]?.toLowerCase() || ''
                bVal = b["category[0]"]?.toLowerCase() || ''
            } else if (sortColumn === 'status') {
                aVal = a.status || ''
                bVal = b.status || ''
            }

            if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
            if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
            return 0
        })
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Products</h1>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-4">
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search finds..."
                        className="pl-9"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                {canAdd && <ItemForm mode="create" onSuccess={() => router.refresh()} />}
            </div>

            {/* Status Filters */}
            <div className="flex gap-2 mb-4">
                <Button
                    variant={statusFilter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusAndUrl('all')}
                >
                    All
                </Button>
                <Button
                    variant={statusFilter === 'published' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusAndUrl('published')}
                >
                    Published
                </Button>
                <Button
                    variant={statusFilter === 'draft' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusAndUrl('draft')}
                >
                    Drafts
                </Button>
                <Button
                    variant={statusFilter === 'boosted' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusAndUrl('boosted')}
                >
                    Boosted
                </Button>
            </div>

            {/* Table */}
            <div className="rounded-md border border-border bg-card overflow-hidden">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted text-muted-foreground font-medium border-b border-border">
                                <tr>
                                    <th className="hidden sm:table-cell px-3 py-2 sm:px-4 sm:py-3 w-[50px]"></th>
                                    <th className="px-3 py-2 sm:px-4 sm:py-3">Image</th>
                                    <th className="px-3 py-2 sm:px-4 sm:py-3">
                                        <button
                                            onClick={() => handleSort('name')}
                                            className="flex items-center hover:text-foreground transition-colors"
                                        >
                                            Name
                                            <SortIcon column="name" />
                                        </button>
                                    </th>
                                    <th className="hidden lg:table-cell px-3 py-2 sm:px-4 sm:py-3">
                                        <button
                                            onClick={() => handleSort('brand')}
                                            className="flex items-center hover:text-foreground transition-colors"
                                        >
                                            Brand
                                            <SortIcon column="brand" />
                                        </button>
                                    </th>
                                    <th className="px-3 py-2 sm:px-4 sm:py-3">
                                        <button
                                            onClick={() => handleSort('price')}
                                            className="flex items-center hover:text-foreground transition-colors"
                                        >
                                            Price
                                            <SortIcon column="price" />
                                        </button>
                                    </th>
                                    <th className="hidden xl:table-cell px-3 py-2 sm:px-4 sm:py-3">
                                        <button
                                            onClick={() => handleSort('category')}
                                            className="flex items-center hover:text-foreground transition-colors"
                                        >
                                            Category
                                            <SortIcon column="category" />
                                        </button>
                                    </th>
                                    <th className="hidden sm:table-cell px-3 py-2 sm:px-4 sm:py-3">
                                        <button
                                            onClick={() => handleSort('status')}
                                            className="flex items-center hover:text-foreground transition-colors"
                                        >
                                            Status
                                            <SortIcon column="status" />
                                        </button>
                                    </th>
                                    {(canEdit || canRemove) && <th className="px-3 py-2 sm:px-4 sm:py-3 text-right">Actions</th>}
                                </tr>
                            </thead>
                            <SortableContext
                                items={filteredItems.map(i => i._id)}
                                strategy={verticalListSortingStrategy}
                            >
                                <tbody className="divide-y divide-border">
                                    {filteredItems.map((item) => (
                                        <SortableRow
                                            key={item._id}
                                            item={item}
                                            canEdit={canEdit}
                                            canRemove={canRemove}
                                            handleDelete={handleDelete}
                                            router={router}
                                        />
                                    ))}
                                    {filteredItems.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                                                No items found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </SortableContext>
                        </table>
                    </div>
                </DndContext>
            </div>
        </div>
    )
}

function SortableRow({ item, canEdit, canRemove, handleDelete, router }: { item: NormalizedFind, canEdit: boolean, canRemove: boolean, handleDelete: (id: number) => void, router: any }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: item._id, disabled: !canEdit });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <tr ref={setNodeRef} style={style} className="hover:bg-muted/50 transition-colors bg-card">
            <td className={`hidden sm:table-cell px-3 py-2 sm:px-4 sm:py-3 touch-none ${canEdit ? "cursor-move" : "cursor-default opacity-60"}`} {...(canEdit ? attributes : {})} {...(canEdit ? listeners : {})}>
                <GripVertical className="h-4 w-4 text-muted-foreground" />
            </td>
            <td className="px-3 py-2 sm:px-4 sm:py-3">
                <div className="h-9 w-9 sm:h-10 sm:w-10 rounded overflow-hidden bg-background border border-border">
                    <img src={item.image} alt="" className="h-full w-full object-cover" />
                </div>
            </td>
            <td className="px-3 py-2 sm:px-4 sm:py-3 font-medium text-foreground max-w-[140px] sm:max-w-[200px] truncate" title={item.name}>
                {item.name}
            </td>
            <td className="hidden lg:table-cell px-3 py-2 sm:px-4 sm:py-3 text-muted-foreground">{item.brand}</td>
            <td className="px-3 py-2 sm:px-4 sm:py-3 text-foreground">¥{item.price}</td>
            <td className="hidden xl:table-cell px-3 py-2 sm:px-4 sm:py-3 text-muted-foreground">
                <span className="inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                    {item["category[0]"]}
                </span>
            </td>
            <td className="hidden sm:table-cell px-3 py-2 sm:px-4 sm:py-3">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${item.status === 'draft'
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                    : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    }`}>
                    {item.status === 'draft' ? 'Draft' : 'Published'}
                </span>
            </td>
            {(canEdit || canRemove) && (
                <td className="px-3 py-2 sm:px-4 sm:py-3 text-right whitespace-nowrap">
                    <div className="flex justify-end gap-2">
                        {canEdit && (
                            <ItemForm
                                mode="edit"
                                item={item}
                                onSuccess={() => router.refresh()}
                                trigger={
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20">
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                }
                            />
                        )}
                        {canRemove && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                                onClick={() => handleDelete(item._id)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </td>
            )}
        </tr>
    )
}
