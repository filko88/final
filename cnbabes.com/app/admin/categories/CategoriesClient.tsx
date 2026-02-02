"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/utils/supabase/client"
import { Trash2, Pencil, Plus, ChevronRight } from "lucide-react"
import { toast } from "sonner"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { createCategory, updateCategory, deleteCategory } from "@/app/actions/admin-categories"

interface Category {
    id: number
    name: string
    parent_id: number | null
    sort_order: number
}

interface CategoriesClientProps {
    categories: Category[]
}

export default function CategoriesClient({ categories: initialCategories }: CategoriesClientProps) {
    const router = useRouter()
    const supabase = createClient()
    const [categories, setCategories] = useState(initialCategories)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingCategory, setEditingCategory] = useState<Category | null>(null)
    const [formData, setFormData] = useState({ name: "", parent_id: "" })
    const [isMounted, setIsMounted] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    // Organize categories into tree structure
    const mainCategories = categories.filter(c => !c.parent_id)
    const getSubCategories = (parentId: number) =>
        categories.filter(c => c.parent_id === parentId)

    const refreshCategories = async () => {
        const { data } = await supabase
            .from('categories')
            .select('*')
            .order('sort_order', { ascending: true })

        if (data) {
            setCategories(data)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.name.trim()) {
            toast.error("Category name is required")
            return
        }

        const categoryData = {
            name: formData.name.trim(),
            parent_id: formData.parent_id && formData.parent_id !== 'none' ? parseInt(formData.parent_id) : null,
            sort_order: editingCategory?.sort_order ?? 0
        }

        if (editingCategory) {
            const result = await updateCategory({ id: editingCategory.id, ...categoryData })
            if ("error" in result) {
                toast.error("Failed to update category", { description: result.error ?? "Unknown error" })
            } else {
                toast.success("Category updated")
                await refreshCategories()
                router.refresh()
                resetForm()
            }
        } else {
            const result = await createCategory(categoryData)
            if ("error" in result) {
                toast.error("Failed to create category", { description: result.error ?? "Unknown error" })
            } else {
                toast.success("Category created")
                await refreshCategories()
                router.refresh()
                resetForm()
            }
        }
    }

    const handleDeleteRequest = (category: Category) => {
        setDeleteTarget(category)
        setIsDeleteDialogOpen(true)
    }

    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return

        const result = await deleteCategory({ id: deleteTarget.id })
        if ("error" in result) {
            toast.error("Failed to delete", { description: result.error ?? "Unknown error" })
        } else {
            toast.success("Category deleted")
            router.refresh()
        }
        setIsDeleteDialogOpen(false)
        setDeleteTarget(null)
    }

    const handleDeleteDialogChange = (open: boolean) => {
        setIsDeleteDialogOpen(open)
        if (!open) {
            setDeleteTarget(null)
        }
    }

    const handleEdit = (category: Category) => {
        setEditingCategory(category)
        setFormData({
            name: category.name,
            parent_id: category.parent_id?.toString() ?? 'none'
        })
        setIsDialogOpen(true)
    }

    const resetForm = () => {
        setFormData({ name: "", parent_id: 'none' })
        setEditingCategory(null)
        setIsDialogOpen(false)
    }

    return (
        <div className="flex flex-col gap-4">
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={handleDeleteDialogChange}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete category?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {deleteTarget && getSubCategories(deleteTarget.id).length > 0
                                ? "Are you sure? This will also delete all sub-categories."
                                : "This action cannot be undone."}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDeleteTarget(null)}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={handleDeleteConfirm}
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
                {isMounted ? (
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen} modal>
                        <DialogTrigger asChild>
                            <Button onClick={() => resetForm()}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Category
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <div className="bg-card p-6 rounded-lg border border-border">
                                <DialogHeader className="mb-4">
                                    <DialogTitle>
                                        {editingCategory ? "Edit Category" : "Create Category"}
                                    </DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium">Name</label>
                                        <Input
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="Category name"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Parent Category</label>
                                        <Select
                                            value={formData.parent_id}
                                            onValueChange={(value) => setFormData({ ...formData, parent_id: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select parent category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">Create as new main category</SelectItem>
                                                {mainCategories.map(cat => (
                                                    <SelectItem key={cat.id} value={cat.id.toString()}>
                                                        {cat.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex gap-2 pt-4">
                                        <Button type="submit" className="flex-1">
                                            {editingCategory ? "Update" : "Create"}
                                        </Button>
                                        <Button type="button" variant="outline" onClick={resetForm}>
                                            Cancel
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </DialogContent>
                    </Dialog>
                ) : (
                    <Button disabled>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Category
                    </Button>
                )}
            </div>

            {/* Categories Tree View */}
            <div className="space-y-4">
                {mainCategories.map(mainCat => (
                    <div key={mainCat.id} className="rounded-md border border-border bg-card overflow-hidden">
                        {/* Main Category */}
                        <div className="flex items-center justify-between p-4 bg-muted/40 hover:bg-muted/60 transition-colors">
                            <div className="flex items-center gap-2 font-semibold">
                                {mainCat.name}
                                <span className="text-xs text-muted-foreground">
                                    ({getSubCategories(mainCat.id).length} sub-categories)
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleEdit(mainCat)}
                                >
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-red-500 hover:text-red-600"
                                    onClick={() => handleDeleteRequest(mainCat)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Sub Categories */}
                        {getSubCategories(mainCat.id).length > 0 && (
                            <div className="divide-y divide-border">
                                {getSubCategories(mainCat.id).map(subCat => (
                                    <div key={subCat.id} className="flex items-center justify-between p-4 pl-12 hover:bg-muted/30 border-t border-border">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <ChevronRight className="h-4 w-4" />
                                            {subCat.name}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => handleEdit(subCat)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-red-500 hover:text-red-600"
                                                onClick={() => handleDeleteRequest(subCat)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
