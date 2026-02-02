"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/utils/supabase/client"
import { Trash2, Pencil, Search, Plus, Loader2, Upload, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { fetchRemoteImage } from "@/app/actions/remote-image"

interface Seller {
    id: string
    name: string
    description: string | null
    link: string | null
    tags: string[] | null
    image: string | null // Keep for backward compat or just ignore
    avatar_url: string | null
    banner_url: string | null
    created_at: string
}

interface AdminSellersClientProps {
    initialSellers: Seller[]
}

const CATEGORIES = ["Shoes", "Clothes", "Jackets", "Accessories", "Decor", "Electronics"]

export default function AdminSellersClient({ initialSellers }: AdminSellersClientProps) {
    const router = useRouter()
    const supabase = createClient()
    const [search, setSearch] = useState("")
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [editingSeller, setEditingSeller] = useState<Seller | null>(null)
    const [uploadingAvatar, setUploadingAvatar] = useState(false)
    const [uploadingBanner, setUploadingBanner] = useState(false)
    const IMAGE_BUCKET = "img"
    const IMAGE_FOLDER = "sellers"

    const getExtensionFromMime = (mime: string) => {
        if (mime.includes("jpeg")) return "jpg"
        if (mime.includes("png")) return "png"
        if (mime.includes("webp")) return "webp"
        if (mime.includes("gif")) return "gif"
        if (mime.includes("avif")) return "avif"
        return ""
    }

    const getExtensionFromUrl = (url: string) => {
        const match = url.split("?")[0].split("#")[0].match(/\.(\w+)$/)
        if (!match) return ""
        const ext = match[1].toLowerCase()
        if (["jpg", "jpeg", "png", "webp", "gif", "avif"].includes(ext)) {
            return ext === "jpeg" ? "jpg" : ext
        }
        return ""
    }

    const base64ToBlob = (base64: string, contentType: string) => {
        const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
        return new Blob([bytes], { type: contentType })
    }

    const uploadImageBlob = async (blob: Blob, fileExt: string) => {
        const safeExt = fileExt || "png"
        const fileName = `${IMAGE_FOLDER}/${Date.now()}-${Math.random().toString(36).substring(2)}.${safeExt}`

        const { error: uploadError } = await supabase.storage
            .from(IMAGE_BUCKET)
            .upload(fileName, blob, {
                contentType: blob.type || `image/${safeExt}`,
            })

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
            .from(IMAGE_BUCKET)
            .getPublicUrl(fileName)

        return publicUrl
    }

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        link: "",
        tags: [] as string[],
        avatar_url: "",
        banner_url: "",
    })

    const filteredSellers = initialSellers.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase())
    )

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this seller?")) return

        const { error } = await supabase.from("sellers").delete().eq("id", id)
        if (error) {
            toast.error("Failed to delete", { description: error.message })
        } else {
            toast.success("Seller deleted")
            router.refresh()
        }
    }

    const toggleTag = (tag: string) => {
        setFormData(prev => {
            const currentTags = prev.tags || []
            if (currentTags.includes(tag)) {
                return { ...prev, tags: currentTags.filter(t => t !== tag) }
            } else {
                return { ...prev, tags: [...currentTags, tag] }
            }
        })
    }

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'avatar_url' | 'banner_url') => {
        const file = e.target.files?.[0]
        if (!file) return

        const setUploading = field === 'avatar_url' ? setUploadingAvatar : setUploadingBanner
        setUploading(true)
        const toastId = toast.loading(`Uploading ${field === 'avatar_url' ? 'avatar' : 'banner'}...`)

        try {
            const fileExt = file.name.split('.').pop() || getExtensionFromMime(file.type)
            const publicUrl = await uploadImageBlob(file, fileExt)
            setFormData(prev => ({ ...prev, [field]: publicUrl }))

            toast.success("Upload successful!", { id: toastId })
        } catch (error: any) {
            console.error("Upload Error:", error)
            toast.error("Upload failed", { id: toastId, description: error.message })
        } finally {
            setUploading(false)
            e.target.value = ''
        }
    }

    const handleImagePaste = async (e: React.ClipboardEvent<HTMLInputElement>, field: 'avatar_url' | 'banner_url') => {
        const imageItem = Array.from(e.clipboardData.items).find(item => item.type.startsWith("image/"))
        if (imageItem) {
            e.preventDefault()
            const file = imageItem.getAsFile()
            if (!file) return
            const setUploading = field === 'avatar_url' ? setUploadingAvatar : setUploadingBanner
            setUploading(true)
            const toastId = toast.loading("Uploading pasted image...")

            try {
                const fileExt = file.name.split('.').pop() || getExtensionFromMime(file.type)
                const publicUrl = await uploadImageBlob(file, fileExt)
                setFormData(prev => ({ ...prev, [field]: publicUrl }))
                toast.success("Image uploaded!", { id: toastId })
            } catch (error: any) {
                console.error("Paste Upload Error:", error)
                toast.error("Paste upload failed", { id: toastId, description: error.message })
            } finally {
                setUploading(false)
            }
            return
        }

        const text = e.clipboardData.getData("text")
        if (text && /^https?:\/\//i.test(text)) {
            e.preventDefault()
            const setUploading = field === 'avatar_url' ? setUploadingAvatar : setUploadingBanner
            setUploading(true)
            const toastId = toast.loading("Importing image from URL...")

            try {
                const result = await fetchRemoteImage(text)
                if ("error" in result) throw new Error(result.error)
                const blob = base64ToBlob(result.base64, result.contentType)
                const fileExt = getExtensionFromMime(result.contentType) || getExtensionFromUrl(text)
                const publicUrl = await uploadImageBlob(blob, fileExt)
                setFormData(prev => ({ ...prev, [field]: publicUrl }))
                toast.success("Image imported!", { id: toastId })
            } catch (error: any) {
                console.error("URL Import Error:", error)
                toast.error("URL import failed", { id: toastId, description: error.message })
            } finally {
                setUploading(false)
            }
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const payload = {
            name: formData.name,
            description: formData.description,
            link: formData.link,
            tags: formData.tags,
            avatar_url: formData.avatar_url,
            banner_url: formData.banner_url,
            updated_at: new Date().toISOString()
        }

        let error

        if (editingSeller) {
            const result = await supabase.from("sellers").update(payload).eq("id", editingSeller.id)
            error = result.error
        } else {
            const result = await supabase.from("sellers").insert([payload])
            error = result.error
        }

        if (error) {
            toast.error("Failed to save seller", { description: error.message })
        } else {
            toast.success(editingSeller ? "Seller updated" : "Seller created")
            setIsDialogOpen(false)
            router.refresh()
            resetForm()
        }
    }

    const resetForm = () => {
        setFormData({ name: "", description: "", link: "", tags: [], avatar_url: "", banner_url: "" })
        setEditingSeller(null)
    }

    const openEdit = (seller: Seller) => {
        setEditingSeller(seller)
        setFormData({
            name: seller.name,
            description: seller.description || "",
            link: seller.link || "",
            tags: seller.tags || [],
            avatar_url: seller.avatar_url || seller.image || "", // Fallback to old image if avatar missing
            banner_url: seller.banner_url || "",
        })
        setIsDialogOpen(true)
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Sellers</h1>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-4">
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search sellers..."
                        className="pl-9"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                    setIsDialogOpen(open)
                    if (!open) resetForm()
                }}>
                    <DialogTrigger asChild>
                        <Button onClick={resetForm}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Seller
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-zinc-950 border border-border sm:rounded-lg shadow-lg p-6">
                        <DialogHeader>
                            <DialogTitle>{editingSeller ? "Edit Seller" : "Add New Seller"}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="link">Shop Link</Label>
                                    <Input
                                        id="link"
                                        value={formData.link}
                                        onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Tags</Label>
                                <div className="flex flex-wrap gap-2 pt-1">
                                    {CATEGORIES.map((tag) => {
                                        const isSelected = formData.tags.includes(tag)
                                        return (
                                            <button
                                                key={tag}
                                                type="button"
                                                onClick={() => toggleTag(tag)}
                                                className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-colors ${isSelected
                                                    ? "bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900"
                                                    : "bg-transparent text-muted-foreground border-input hover:bg-muted hover:text-foreground"
                                                    }`}
                                            >
                                                {tag}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                                {/* Avatar Upload */}
                                <div className="space-y-2">
                                    <Label>Profile Picture</Label>
                                    <div className="flex gap-3 items-start">
                                        <div className="h-16 w-16 rounded-full bg-muted border border-border flex items-center justify-center overflow-hidden shrink-0">
                                            {formData.avatar_url ? (
                                                <img src={formData.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                                            ) : (
                                                <span className="text-xs text-muted-foreground">No Img</span>
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <Input
                                                value={formData.avatar_url}
                                                onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                                                placeholder="Paste image URL or Ctrl+V an image"
                                                className="text-xs"
                                                onPaste={(e) => handleImagePaste(e, 'avatar_url')}
                                            />
                                            <div className="relative">
                                                <Button type="button" variant="secondary" size="sm" className="w-full" disabled={uploadingAvatar}>
                                                    {uploadingAvatar ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Upload className="h-3 w-3 mr-2" />}
                                                    Upload PFP
                                                </Button>
                                                <Input
                                                    type="file"
                                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                                    onChange={(e) => handleUpload(e, 'avatar_url')}
                                                    accept="image/*"
                                                    disabled={uploadingAvatar}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Banner Upload */}
                                <div className="space-y-2">
                                    <Label>Banner Image</Label>
                                    <div className="flex gap-3 items-start">
                                        <div className="h-16 w-32 rounded-md bg-muted border border-border flex items-center justify-center overflow-hidden shrink-0">
                                            {formData.banner_url ? (
                                                <img src={formData.banner_url} alt="Banner" className="h-full w-full object-cover" />
                                            ) : (
                                                <span className="text-xs text-muted-foreground">No Img</span>
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <Input
                                                value={formData.banner_url}
                                                onChange={(e) => setFormData({ ...formData, banner_url: e.target.value })}
                                                placeholder="Paste image URL or Ctrl+V an image"
                                                className="text-xs"
                                                onPaste={(e) => handleImagePaste(e, 'banner_url')}
                                            />
                                            <div className="relative">
                                                <Button type="button" variant="secondary" size="sm" className="w-full" disabled={uploadingBanner}>
                                                    {uploadingBanner ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Upload className="h-3 w-3 mr-2" />}
                                                    Upload Banner
                                                </Button>
                                                <Input
                                                    type="file"
                                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                                    onChange={(e) => handleUpload(e, 'banner_url')}
                                                    accept="image/*"
                                                    disabled={uploadingBanner}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                <Button type="submit">Save Seller</Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Table */}
            <div className="rounded-md border border-border bg-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted text-muted-foreground font-medium border-b border-border">
                            <tr>
                                <th className="px-4 py-3">Seller</th>
                                <th className="px-4 py-3">Description</th>
                                <th className="px-4 py-3">Tags</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredSellers.map((seller) => (
                                <tr key={seller.id} className="hover:bg-muted/50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center overflow-hidden border border-border shrink-0">
                                                {(seller.avatar_url || seller.image) ? (
                                                    <img src={seller.avatar_url || seller.image || ""} alt="" className="h-full w-full object-cover" />
                                                ) : (
                                                    <div className="text-xs font-bold">{seller.name.substring(0, 2).toUpperCase()}</div>
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-foreground">{seller.name}</span>
                                                {seller.link ? (
                                                    <a href={seller.link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1">
                                                        Visit Shop <ExternalLink className="h-3 w-3" />
                                                    </a>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">No link</span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground max-w-[300px] truncate" title={seller.description || ""}>
                                        {seller.description || "-"}
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">
                                        <div className="flex flex-wrap gap-1">
                                            {seller.tags?.slice(0, 3).map((tag, i) => (
                                                <span key={i} className="inline-flex items-center rounded-full border border-border px-2 py-0.5 text-xs">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                                                onClick={() => openEdit(seller)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                                                onClick={() => handleDelete(seller.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredSellers.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                                        No sellers found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div >
    )
}

