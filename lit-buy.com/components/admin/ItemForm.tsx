"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import FindsCard from "@/components/FindsCard"
import { toast } from "sonner"
import type { NormalizedFind } from "@/lib/finds-source"
import { Loader2, Plus, Pencil, Link as LinkIcon, DownloadCloud, Upload } from "lucide-react"
import { LinkConverter } from "@/app/lib/link-converter"
import { usePreferences } from "@/hooks/use-preferences"
import { fetchProductDetails } from "@/app/actions/fetch-product"
import { fetchRemoteImage } from "@/app/actions/remote-image"
import { convertLink } from "@/app/actions/link-converter"

interface Category {
    id: number
    name: string
    parent_id: number | null
    sort_order: number
}


interface ItemFormProps {
    item?: NormalizedFind
    mode?: "create" | "edit"
    onSuccess?: () => void
    trigger?: React.ReactNode
}

export default function ItemForm({ item, mode = "create", onSuccess, trigger }: ItemFormProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [isFetching, setIsFetching] = useState(false)
    const supabase = createClient()
    const { selectedAgent, selectedCurrency, convertFromCny } = usePreferences()
    const [uploading, setUploading] = useState(false)
    const [categories, setCategories] = useState<Category[]>([])
    const [mainCategoryId, setMainCategoryId] = useState("")
    const [subCategoryId, setSubCategoryId] = useState("")
    const [mainQuery, setMainQuery] = useState("")
    const [subQuery, setSubQuery] = useState("")
    const [mainOpen, setMainOpen] = useState(false)
    const [subOpen, setSubOpen] = useState(false)
    const [imagePreview, setImagePreview] = useState(item?.image ?? "")
    const [brandQuery, setBrandQuery] = useState(item?.brand ?? "")
    const [brandOptions, setBrandOptions] = useState<string[]>([])
    const [brandOpen, setBrandOpen] = useState(false)
    const [namePreview, setNamePreview] = useState(item?.name ?? "")
    const [pricePreview, setPricePreview] = useState(item?.price ? String(item.price) : "")
    const [linkPreview, setLinkPreview] = useState(item?.link || item?.rawUrl || "")
    const [step, setStep] = useState<1 | 2 | 3>(1)
    const [convertedOopbuyLink, setConvertedOopbuyLink] = useState(item?.link ?? "")
    const [isConvertingLink, setIsConvertingLink] = useState(false)
    const IMAGE_BUCKET = "img"
    const IMAGE_FOLDER = "items"
    const previewImageFallback = "https://placehold.co/600x600?text=Preview"

    const resetForm = () => {
        setMainCategoryId("")
        setSubCategoryId("")
        setMainQuery("")
        setSubQuery("")
        setMainOpen(false)
        setSubOpen(false)
        setBrandOpen(false)
        setStep(1)
        setUploading(false)
        setIsFetching(false)
        setLoading(false)
        setIsConvertingLink(false)
        if (mode === "edit" && item) {
            setImagePreview(item.image ?? "")
            setBrandQuery(item.brand ?? "")
            setNamePreview(item.name ?? "")
            setPricePreview(item.price ? String(item.price) : "")
            setLinkPreview(item.link || item.rawUrl || "")
            setConvertedOopbuyLink(item.link ?? "")
        } else {
            setImagePreview("")
            setBrandQuery("")
            setNamePreview("")
            setPricePreview("")
            setLinkPreview("")
            setConvertedOopbuyLink("")
        }
        const imageInput = document.getElementById('image') as HTMLInputElement
        if (imageInput) imageInput.value = ""
    }

    const convertLinkToOopbuy = async (originalLink: string): Promise<string> => {
        if (!originalLink || isConvertingLink) return ""
        setIsConvertingLink(true)
        try {
            const conversionResult = await convertLink(originalLink)
            if ("error" in conversionResult) {
                toast.error("Link conversion failed", { description: conversionResult.error })
                return ""
            }
            const convertedData = conversionResult.data as Record<string, unknown>
            const oopbuyLink = typeof convertedData?.oopbuy === "string"
                ? (convertedData.oopbuy as string)
                : ""
            if (!oopbuyLink) {
                toast.error("Link conversion failed", { description: "No OOPBuy link returned" })
                return ""
            }
            setConvertedOopbuyLink(oopbuyLink)
            return oopbuyLink
        } catch (error: any) {
            toast.error("Link conversion failed", { description: error?.message || "Unknown error" })
            return ""
        } finally {
            setIsConvertingLink(false)
        }
    }

    const selectBestMatch = (options: Category[], query: string) => {
        const normalized = query.trim().toLowerCase()
        if (!normalized) return options[0] ?? null
        return options.find((cat) => cat.name.toLowerCase().startsWith(normalized))
            ?? options.find((cat) => cat.name.toLowerCase().includes(normalized))
            ?? options[0]
            ?? null
    }

    const selectBestBrandMatch = (options: string[], query: string) => {
        const normalized = query.trim().toLowerCase()
        if (!normalized) return options[0] ?? null
        return options.find((brand) => brand.toLowerCase().startsWith(normalized))
            ?? options.find((brand) => brand.toLowerCase().includes(normalized))
            ?? options[0]
            ?? null
    }

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

    const setImageInputValue = (url: string) => {
        const imageInput = document.getElementById('image') as HTMLInputElement
        if (imageInput) imageInput.value = url
        setImagePreview(url)
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

    // Fetch categories from database
    useEffect(() => {
        const fetchCategories = async () => {
            const { data } = await supabase
                .from('categories')
                .select('*')
                .order('sort_order', { ascending: true })

            if (data) {
                setCategories(data)

            }
        }
        const fetchBrands = async () => {
            const { data } = await supabase
                .from('finds')
                .select('brand')

            if (data) {
                const unique = new Set<string>()
                data.forEach((row: { brand?: string | null }) => {
                    const value = (row.brand ?? "").toString().trim()
                    if (value) unique.add(value)
                })
                setBrandOptions(Array.from(unique).sort((a, b) => a.localeCompare(b)))
            }
        }
        fetchCategories()
        fetchBrands()
    }, [supabase])

    useEffect(() => {
        if (!categories.length || !item) return
        const main = categories.find(
            (cat) => !cat.parent_id && cat.name === item["category[0]"]
        )
        const sub = categories.find(
            (cat) => cat.parent_id && cat.name === item["category[1]"]
        )
        if (main) {
            setMainCategoryId(main.id.toString())
            setMainQuery(main.name)
        }
        if (sub) {
            setSubCategoryId(sub.id.toString())
            setSubQuery(sub.name)
        }
    }, [categories, item])

    useEffect(() => {
        setImagePreview(item?.image ?? "")
    }, [item?.image])

    useEffect(() => {
        if (item?.brand) {
            setBrandQuery(item.brand)
        }
    }, [item?.brand])

    useEffect(() => {
        setNamePreview(item?.name ?? "")
        setPricePreview(item?.price ? String(item.price) : "")
        setLinkPreview(item?.link || item?.rawUrl || "")
    }, [item?.name, item?.price, item?.link, item?.rawUrl])

    useEffect(() => {
        if (open) {
            setStep(1)
        }
    }, [open])

    useEffect(() => {
        if (!mainCategoryId) {
            setSubCategoryId("")
            setSubQuery("")
        }
    }, [mainCategoryId])

    // Auto-fetch logic
    const handleLinkPaste = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const url = e.target.value
        if (!url || mode === 'edit') return // Only auto-fetch on create or explicit action? Let's just do it on paste for now. 
        // Actually, let's make it a button or effect. User might want to edit.
        // Let's add a button to "Fetch Details" next to the link input.
    }

    const fetchDetails = async () => {
        const url = linkPreview.trim()
        if (!url) return

        setIsFetching(true)
        const toastId = toast.loading("Fetching product details...")

        try {
            const converter = new LinkConverter()
            const { marketplace, productId, rawUrl } = converter.resolveMarketplaceAndId("", url)

            if (!marketplace || !productId) {
                toast.error("Invalid link", { id: toastId })
                return
            }

            // Map marketplace to ACBuy source
            let source = ""
            if (marketplace === "1688") source = "AL"
            else if (marketplace === "weidian") source = "WD"
            else if (marketplace === "taobao" || marketplace === "tmall") source = "TB"

            if (!source) {
                toast.error("Unsupported marketplace for auto-fetch", { id: toastId })
                return
            }

            const result = await fetchProductDetails(productId, source)
            if ("error" in result) throw new Error(result.error)
            const data = result.data

            if (data.code !== 200 || !data.data) {
                throw new Error(data.msg || "Failed to fetch data")
            }

            const product = data.data

            // Auto-fill form
            // We need to use refs or getElementById for direct DOM manipulation if not controlled, 
            // but here we are using uncontrolled inputs with defaultValues basically.
            // Since `defaultValue` only sets initial value, we should probably set values directly on the inputs.

            setNamePreview(product.title || "")
            setPricePreview(product.price ? String(product.price) : "")
            setImagePreview(product.picUrl || "")
            setLinkPreview(rawUrl)

            // Generate for current selected agent if strictly needed? 
            // The item schema has specific agent link fields, so we just fill those.

            toast.success("Details fetched!", { id: toastId })

        } catch (err: any) {
            console.error(err)
            toast.error("Failed to fetch details", { id: toastId, description: err.message })
        } finally {
            setIsFetching(false)
        }
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        const toastId = toast.loading("Uploading image...")

        try {
            const fileExt = file.name.split('.').pop() || getExtensionFromMime(file.type)
            const publicUrl = await uploadImageBlob(file, fileExt)
            setImageInputValue(publicUrl)

            toast.success("Image uploaded!", { id: toastId })
        } catch (error: any) {
            console.error("Upload Error:", error)
            toast.error("Upload failed", { id: toastId, description: error.message })
        } finally {
            setUploading(false)
            // Reset file input so same file can be selected again if needed
            e.target.value = ''
        }
    }

    const handleImagePaste = async (e: React.ClipboardEvent<HTMLInputElement>) => {
        const imageItem = Array.from(e.clipboardData.items).find(item => item.type.startsWith("image/"))
        if (imageItem) {
            e.preventDefault()
            const file = imageItem.getAsFile()
            if (!file) return
            setUploading(true)
            const toastId = toast.loading("Uploading pasted image...")

            try {
                const fileExt = file.name.split('.').pop() || getExtensionFromMime(file.type)
                const publicUrl = await uploadImageBlob(file, fileExt)
                setImageInputValue(publicUrl)
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
            setUploading(true)
            const toastId = toast.loading("Importing image from URL...")

            try {
                const result = await fetchRemoteImage(text)
                if ("error" in result) throw new Error(result.error)
                const blob = base64ToBlob(result.base64, result.contentType)
                const fileExt = getExtensionFromMime(result.contentType) || getExtensionFromUrl(text)
                const publicUrl = await uploadImageBlob(blob, fileExt)
                setImageInputValue(publicUrl)
                toast.success("Image imported!", { id: toastId })
            } catch (error: any) {
                console.error("URL Import Error:", error)
                toast.error("URL import failed", { id: toastId, description: error.message })
            } finally {
                setUploading(false)
            }
        }
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const rawData = Object.fromEntries(formData.entries())

        const originalLink = typeof rawData.link === "string" ? rawData.link.trim() : ""
        if (!originalLink) {
            toast.error("Product link is required")
            setLoading(false)
            return
        }

        let linkToSave = convertedOopbuyLink
        if (!linkToSave) {
            linkToSave = await convertLinkToOopbuy(originalLink)
        }
        if (!linkToSave) {
            toast.error("Link conversion failed", { description: "No OOPBuy link returned" })
            setLoading(false)
            return
        }

        // Construct Payload
        const selectedMain = categories.find((cat) => cat.id === Number(mainCategoryId))
        const selectedSub = categories.find((cat) => cat.id === Number(subCategoryId))

        if (!selectedMain) {
            toast.error("Main category is required")
            setLoading(false)
            return
        }

        const payload = {
            name: rawData.name,
            price: Number(rawData.price),
            image: rawData.image,
            // original_link removed - does not exist in DB
            link: linkToSave,
            category_0: selectedMain.name,
            category_1: selectedSub?.name ?? null,
            brand: rawData.brand,
            status: rawData.status || 'published',
            boost_order: rawData.boost ? 1 : 0,
            // Optional defaults
            view_count: item?.view_count || 0,
            updated_at: new Date().toISOString(),
        }

        try {
            if (mode === "create") {
                const { error } = await supabase.from("finds").insert([{
                    ...payload,
                    created_at: new Date().toISOString()
                }])
                if (error) throw error
                toast.success("Item created successfully")
            } else {
                const { error } = await supabase.from("finds").update(payload).eq("id", item?._id)
                if (error) throw error
                toast.success("Item updated successfully")
            }

            resetForm()
            setOpen(false)
            if (onSuccess) onSuccess()
        } catch (error: any) {
            console.error("Submission Error:", error)
            // Log specific Supabase error fields if available
            if (error.code) console.error("Error Code:", error.code)
            if (error.details) console.error("Error Details:", error.details)
            if (error.hint) console.error("Error Hint:", error.hint)

            toast.error(`Error ${mode}ing item`, { description: error.message || "Unknown error occurred" })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(nextOpen) => {
                setOpen(nextOpen)
                if (!nextOpen) resetForm()
            }}
        >
            <DialogTrigger asChild>
                {trigger || (
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Add New Item
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-zinc-950 border border-border sm:rounded-lg shadow-lg p-6">
                <DialogHeader>
                    <DialogTitle>{mode === "create" ? "Add New Find" : "Edit Find"}</DialogTitle>
                </DialogHeader>
                {mode === "create" && <Separator className="my-2 bg-border/60" />}

                <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full border text-xs font-semibold ${step >= 1 ? "border-foreground text-foreground" : "border-border text-muted-foreground"}`}>
                                1
                            </span>
                            <span className={`font-medium ${step >= 1 ? "text-foreground" : "text-muted-foreground"}`}>Details</span>
                            <span className="mx-2 h-px w-8 bg-border" />
                            <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full border text-xs font-semibold ${step >= 2 ? "border-foreground text-foreground" : "border-border text-muted-foreground"}`}>
                                2
                            </span>
                            <span className={`font-medium ${step >= 2 ? "text-foreground" : "text-muted-foreground"}`}>Image</span>
                            <span className="mx-2 h-px w-8 bg-border" />
                            <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full border text-xs font-semibold ${step >= 3 ? "border-foreground text-foreground" : "border-border text-muted-foreground"}`}>
                                3
                            </span>
                            <span className={`font-medium ${step >= 3 ? "text-foreground" : "text-muted-foreground"}`}>Preview</span>
                        </div>

                        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${step === 1 ? "" : "hidden"}`} aria-hidden={step !== 1}>
                                <div className="sm:col-span-2 space-y-2">
                                    <Label htmlFor="name">Product Name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        value={namePreview}
                                        onChange={(e) => setNamePreview(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="price">Price (CNY)</Label>
                                    <Input
                                        id="price"
                                        name="price"
                                        type="number"
                                        value={pricePreview}
                                        onChange={(e) => setPricePreview(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="brand">Brand</Label>
                                    <div className="relative">
                                        <Input
                                            id="brand"
                                            name="brand"
                                            value={brandQuery}
                                            placeholder="Type a brand..."
                                            onChange={(e) => {
                                                setBrandQuery(e.target.value)
                                                setBrandOpen(true)
                                            }}
                                            onFocus={() => setBrandOpen(true)}
                                            onBlur={() => setTimeout(() => setBrandOpen(false), 100)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Tab") {
                                                    const options = brandOptions.filter((brand) =>
                                                        brand.toLowerCase().includes(brandQuery.toLowerCase())
                                                    )
                                                    const match = selectBestBrandMatch(options, brandQuery)
                                                    if (match) {
                                                        e.preventDefault()
                                                        setBrandQuery(match)
                                                        setBrandOpen(false)
                                                    }
                                                }
                                            }}
                                        />
                                        {brandOpen ? (
                                            <div className="absolute z-20 mt-1 w-full rounded-md border border-border bg-popover shadow-md max-h-48 overflow-y-auto">
                                                {brandOptions
                                                    .filter((brand) => brand.toLowerCase().includes(brandQuery.toLowerCase()))
                                                    .map((brand) => (
                                                        <button
                                                            key={brand}
                                                            type="button"
                                                            className="w-full text-left px-3 py-2 text-sm hover:bg-muted"
                                                            onMouseDown={(e) => e.preventDefault()}
                                                            onClick={() => {
                                                                setBrandQuery(brand)
                                                                setBrandOpen(false)
                                                            }}
                                                        >
                                                            {brand}
                                                        </button>
                                                    ))}
                                            </div>
                                        ) : null}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Main Category</Label>
                                    <div className="relative">
                                        <Input
                                            placeholder="Search categories..."
                                            value={mainQuery}
                                            onChange={(e) => {
                                                setMainQuery(e.target.value)
                                                setMainOpen(true)
                                                setMainCategoryId("")
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === "Tab") {
                                                    const options = categories.filter((cat) => !cat.parent_id)
                                                        .filter((cat) => cat.name.toLowerCase().includes(mainQuery.toLowerCase()))
                                                    const match = selectBestMatch(options, mainQuery)
                                                    if (match) {
                                                        e.preventDefault()
                                                        setMainCategoryId(match.id.toString())
                                                        setMainQuery(match.name)
                                                        setMainOpen(false)
                                                    }
                                                }
                                            }}
                                            onFocus={() => setMainOpen(true)}
                                            onBlur={() => setTimeout(() => setMainOpen(false), 100)}
                                        />
                                        {mainOpen ? (
                                            <div className="absolute z-20 mt-1 w-full rounded-md border border-border bg-popover shadow-md max-h-48 overflow-y-auto">
                                                {categories
                                                    .filter((cat) => !cat.parent_id)
                                                    .filter((cat) => cat.name.toLowerCase().includes(mainQuery.toLowerCase()))
                                                    .map((cat) => (
                                                        <button
                                                            key={cat.id}
                                                            type="button"
                                                            className="w-full text-left px-3 py-2 text-sm hover:bg-muted"
                                                            onMouseDown={(e) => e.preventDefault()}
                                                            onClick={() => {
                                                                setMainCategoryId(cat.id.toString())
                                                                setMainQuery(cat.name)
                                                                setMainOpen(false)
                                                            }}
                                                        >
                                                            {cat.name}
                                                        </button>
                                                    ))}
                                            </div>
                                        ) : null}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Subcategory</Label>
                                    <div className="relative">
                                        <Input
                                            placeholder="Search subcategories..."
                                            value={subQuery}
                                            onChange={(e) => {
                                                setSubQuery(e.target.value)
                                                setSubOpen(true)
                                                setSubCategoryId("")
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === "Tab") {
                                                    const options = categories
                                                        .filter((cat) => cat.parent_id === Number(mainCategoryId))
                                                        .filter((cat) => cat.name.toLowerCase().includes(subQuery.toLowerCase()))
                                                    const match = selectBestMatch(options, subQuery)
                                                    if (match) {
                                                        e.preventDefault()
                                                        setSubCategoryId(match.id.toString())
                                                        setSubQuery(match.name)
                                                        setSubOpen(false)
                                                    }
                                                }
                                            }}
                                            onFocus={() => setSubOpen(true)}
                                            onBlur={() => setTimeout(() => setSubOpen(false), 100)}
                                            disabled={!mainCategoryId}
                                        />
                                        {subOpen && mainCategoryId ? (
                                            <div className="absolute z-20 mt-1 w-full rounded-md border border-border bg-popover shadow-md max-h-48 overflow-y-auto">
                                                {categories
                                                    .filter((cat) => cat.parent_id === Number(mainCategoryId))
                                                    .filter((cat) => cat.name.toLowerCase().includes(subQuery.toLowerCase()))
                                                    .map((cat) => (
                                                        <button
                                                            key={cat.id}
                                                            type="button"
                                                            className="w-full text-left px-3 py-2 text-sm hover:bg-muted"
                                                            onMouseDown={(e) => e.preventDefault()}
                                                            onClick={() => {
                                                                setSubCategoryId(cat.id.toString())
                                                                setSubQuery(cat.name)
                                                                setSubOpen(false)
                                                            }}
                                                        >
                                                            {cat.name}
                                                        </button>
                                                    ))}
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                                <div className="sm:col-span-2 space-y-2">
                                    <Label htmlFor="link">Original Link (Taobao/Weidian)</Label>
                                    <div className="flex gap-2">
                                    <Input
                                            id="link"
                                            name="link"
                                            value={linkPreview}
                                        onChange={(e) => {
                                            setLinkPreview(e.target.value)
                                            setConvertedOopbuyLink("")
                                        }}
                                            placeholder="Paste link here..."
                                        />
                                        <Button type="button" variant="outline" size="icon" onClick={fetchDetails} disabled={isFetching} title="Auto-fetch details">
                                            {isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <DownloadCloud className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground">Click the cloud icon to auto-fill details from ACBuy.</p>
                                </div>

                                <div className="sm:col-span-2 space-y-2">
                                    <Label htmlFor="boost">Boost</Label>
                                    <div className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2">
                                        <input
                                            id="boost"
                                            name="boost"
                                            type="checkbox"
                                            defaultChecked={(item?.boost_order || 0) > 0}
                                            className="h-4 w-4 rounded border-border"
                                        />
                                        <span className="text-sm text-muted-foreground">Pin to top boost list</span>
                                    </div>
                                </div>
                            </div>
                        <div className={`space-y-2 ${step === 2 ? "" : "hidden"}`} aria-hidden={step !== 2}>
                                <Label htmlFor="image">Image URL or Upload</Label>
                                <div className="flex gap-2 items-center">
                                    <Input
                                        id="image"
                                        name="image"
                                        value={imagePreview}
                                        placeholder="Paste image URL or Ctrl+V an image"
                                        required
                                        className="flex-1"
                                        onPaste={handleImagePaste}
                                        onChange={(e) => setImagePreview(e.target.value)}
                                    />
                                    <div className="relative">
                                        <Button type="button" variant="outline" size="icon" disabled={uploading}>
                                            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                                        </Button>
                                        <Input
                                            type="file"
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            onChange={handleImageUpload}
                                            accept="image/*"
                                            disabled={uploading}
                                        />
                                    </div>
                                </div>
                                <p className="text-[10px] text-muted-foreground">
                                    Paste an image, paste a URL, or click upload.
                                </p>
                        </div>
                        <div className={`flex flex-col gap-4 ${step === 3 ? "" : "hidden"}`} aria-hidden={step !== 3}>
                            <p className="text-sm text-muted-foreground">Preview matches the Finds card</p>
                            <div className="pointer-events-none mx-auto w-full max-w-[200px]">
                                <FindsCard
                                    product={{
                                        _id: item?._id ?? 0,
                                        name: namePreview || "Untitled item",
                                        price: Number.parseFloat(pricePreview) || 0,
                                        image: imagePreview || previewImageFallback,
                                        link: linkPreview || "#",
                                        rawUrl: linkPreview || "#",
                                        marketplace: "preview",
                                        agentLinks: {},
                                        "category[0]": mainQuery || null,
                                        "category[1]": subQuery || null,
                                        "category[2]": null,
                                        brand: brandQuery || "Brand",
                                        batch: null,
                                        view_count: 0,
                                        created_by: item?.created_by ?? "Admin",
                                        created_at: new Date().toISOString(),
                                        updated_at: new Date().toISOString(),
                                        top: false,
                                        boost_order: 0,
                                        sort_order: 0,
                                        status: "published",
                                    }}
                                    currency={selectedCurrency}
                                    selectedAgent={selectedAgent}
                                    convertFromCny={convertFromCny}
                                />
                            </div>
                        </div>
                    </div>


                    <div className="sm:col-span-2 pt-2 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex gap-2">
                            {step > 1 && (
                                <Button type="button" variant="outline" onClick={() => setStep((prev) => (prev === 3 ? 2 : 1))}>
                                    Back
                                </Button>
                            )}
                        </div>

                        <div className="flex gap-2">
                            {step < 3 && (
                                <Button
                                    type="button"
                                    onClick={() => {
                                        if (step === 1) {
                                            void convertLinkToOopbuy(linkPreview.trim())
                                            setStep(2)
                                        } else {
                                            setStep(3)
                                        }
                                    }}
                                >
                                    Next
                                </Button>
                            )}

                            {step === 3 && (
                                <>
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        name="status"
                                        value="draft"
                                        variant="secondary"
                                        onClick={(e) => {
                                            const form = e.currentTarget.closest('form');
                                            if (form) {
                                                const input = document.createElement('input');
                                                input.type = 'hidden';
                                                input.name = 'status';
                                                input.value = 'draft';
                                                form.appendChild(input);
                                            }
                                        }}
                                    >
                                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Save as Draft
                                    </Button>

                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        // Default submit is published behavior
                                        onClick={(e) => {
                                            const form = e.currentTarget.closest('form');
                                            if (form) {
                                                const existing = form.querySelector('input[name="status"]');
                                                if (existing) existing.remove();

                                                const input = document.createElement('input');
                                                input.type = 'hidden';
                                                input.name = 'status';
                                                input.value = 'published';
                                                form.appendChild(input);
                                            }
                                        }}
                                    >
                                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        {mode === "create" ? "Publish" : "Save & Publish"}
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
