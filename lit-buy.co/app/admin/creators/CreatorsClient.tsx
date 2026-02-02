"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/utils/supabase/client"
import { Search, Plus, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { agentOptions, type Agent } from "@/hooks/use-preferences"

interface Creator {
  id: string
  name: string
  affiliate_codes: Record<string, string> | null
}

interface CreatorsClientProps {
  initialCreators: Creator[]
}

const DEFAULT_CODES = agentOptions.reduce((acc, { value }) => {
  acc[value] = ""
  return acc
}, {} as Record<Agent, string>)

const normalizeCodes = (codes?: Record<string, string> | null) => {
  return {
    ...DEFAULT_CODES,
    ...(codes || {}),
  } as Record<Agent, string>
}

const cleanCodes = (codes: Record<Agent, string>) => {
  const entries = Object.entries(codes)
    .map(([agent, code]) => [agent, code.trim()])
    .filter(([, code]) => code.length > 0)
  return Object.fromEntries(entries)
}

export default function CreatorsClient({ initialCreators }: CreatorsClientProps) {
  const router = useRouter()
  const supabase = createClient()
  const [search, setSearch] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCreator, setEditingCreator] = useState<Creator | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const [formData, setFormData] = useState({
    name: "",
    affiliate_codes: { ...DEFAULT_CODES },
  })

  const filteredCreators = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return initialCreators
    return initialCreators.filter((creator) => {
      return creator.name.toLowerCase().includes(q)
    })
  }, [initialCreators, search])

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this creator?")) return

    const { error } = await supabase.from("creators").delete().eq("id", id)
    if (error) {
      toast.error("Failed to delete", { description: error.message })
    } else {
      toast.success("Creator deleted")
      router.refresh()
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      affiliate_codes: { ...DEFAULT_CODES },
    })
    setEditingCreator(null)
  }

  const openEdit = (creator: Creator) => {
    setEditingCreator(creator)
    setFormData({
      name: creator.name,
      affiliate_codes: normalizeCodes(creator.affiliate_codes),
    })
    setIsDialogOpen(true)
  }

  const updateAffiliateCode = (agent: Agent, value: string) => {
    setFormData((prev) => ({
      ...prev,
      affiliate_codes: {
        ...prev.affiliate_codes,
        [agent]: value,
      },
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const payload = {
      name: formData.name.trim(),
      affiliate_codes: cleanCodes(formData.affiliate_codes),
    }

    let error

    if (editingCreator) {
      const result = await supabase
        .from("creators")
        .update(payload)
        .eq("id", editingCreator.id)
      error = result.error
    } else {
      const result = await supabase.from("creators").insert([payload])
      error = result.error
    }

    if (error) {
      toast.error("Failed to save creator", { description: error.message })
    } else {
      toast.success(editingCreator ? "Creator updated" : "Creator created")
      setIsDialogOpen(false)
      router.refresh()
      resetForm()
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Creators</h1>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-4">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search creators..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {mounted ? (
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open)
              if (!open) resetForm()
            }}
          >
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                Add Creator
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-zinc-950 border border-border sm:rounded-lg shadow-lg p-6">
              <DialogHeader>
                <DialogTitle>{editingCreator ? "Edit Creator" : "Add New Creator"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
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
                  <Label>Affiliate codes by agent</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {agentOptions.map(({ value, label }) => (
                      <div key={value} className="space-y-1">
                        <Label className="text-xs text-muted-foreground">{label}</Label>
                        <Input
                          value={formData.affiliate_codes[value] || ""}
                          onChange={(e) => updateAffiliateCode(value, e.target.value)}
                          placeholder="Affiliate code"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Save Creator</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        ) : null}
      </div>

      <div className="rounded-md border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted text-muted-foreground font-medium border-b border-border">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Affiliate Codes</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredCreators.map((creator) => {
                const codes = creator.affiliate_codes || {}
                const formattedCodes = agentOptions
                  .map(({ value, label }) => {
                    const code = codes[value]
                    if (!code) return null
                    return { label, code }
                  })
                  .filter(Boolean) as { label: string; code: string }[]
                const visibleCodes = formattedCodes.slice(0, 3)
                const extraCount = formattedCodes.length - visibleCodes.length

                return (
                  <tr key={creator.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-medium text-foreground">{creator.name}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formattedCodes.length === 0 ? (
                        <span className="text-xs text-muted-foreground">No codes set</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {visibleCodes.map((item) => (
                            <span
                              key={`${creator.id}-${item.label}`}
                              className="inline-flex items-center rounded-full border border-border px-2 py-0.5 text-xs"
                            >
                              {item.label}: {item.code}
                            </span>
                          ))}
                          {extraCount > 0 && (
                            <span className="inline-flex items-center rounded-full border border-border px-2 py-0.5 text-xs">
                              +{extraCount} more
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                          onClick={() => openEdit(creator)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                          onClick={() => handleDelete(creator.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filteredCreators.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                    No creators found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
