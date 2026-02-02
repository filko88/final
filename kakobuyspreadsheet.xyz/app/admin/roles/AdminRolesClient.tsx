"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"

interface UserRole {
    id?: string
    user_id: string
    email?: string | null
    role?: "admin" | null
    created_at?: string
    can_add?: boolean | null
    can_edit?: boolean | null
    can_remove?: boolean | null
    scope_finds?: boolean | null
    scope_girls?: boolean | null
}

interface AdminRolesClientProps {
    initialRoles: UserRole[]
}

export default function AdminRolesClient({ initialRoles }: AdminRolesClientProps) {
    const router = useRouter()
    const supabase = createClient()
    const [search, setSearch] = useState("")
    const [roles, setRoles] = useState<UserRole[]>(initialRoles)
    const [dirty, setDirty] = useState<Record<string, boolean>>({})
    const [savingId, setSavingId] = useState<string | null>(null)

    const filteredRoles = useMemo(() => {
        const query = search.trim().toLowerCase()
        if (!query) return roles
        return roles.filter((row) => {
            const target = `${row.email || ""} ${row.user_id || ""}`.toLowerCase()
            return target.includes(query)
        })
    }, [roles, search])

    const updatePermission = (userId: string, field: "can_add" | "can_edit" | "can_remove", value: boolean) => {
        setRoles((prev) =>
            prev.map((row) => (row.user_id === userId ? { ...row, [field]: value } : row))
        )
        setDirty((prev) => ({ ...prev, [userId]: true }))
    }

    const updateScope = (userId: string, scope: "both" | "finds" | "girls") => {
        const scopeUpdate = {
            scope_finds: scope === "both" || scope === "finds",
            scope_girls: scope === "both" || scope === "girls",
        }
        setRoles((prev) =>
            prev.map((row) => (row.user_id === userId ? { ...row, ...scopeUpdate } : row))
        )
        setDirty((prev) => ({ ...prev, [userId]: true }))
    }

    const handleSave = async (row: UserRole) => {

        setSavingId(row.user_id)
        const isAdmin = row.role === "admin"
        const payload = {
            user_id: row.user_id,
            role: row.role === "admin" ? "admin" : null,
            can_add: isAdmin ? true : !!row.can_add,
            can_edit: isAdmin ? true : !!row.can_edit,
            can_remove: isAdmin ? true : !!row.can_remove,
            scope_finds: isAdmin ? true : !!row.scope_finds,
            scope_girls: isAdmin ? true : !!row.scope_girls,
        }

        const { error } = await supabase
            .from("user_roles")
            .upsert([payload], { onConflict: "user_id" })

        if (error) {
            toast.error("Failed to update role", { description: error.message })
        } else {
            toast.success("Role updated")
            setDirty((prev) => ({ ...prev, [row.user_id]: false }))
            router.refresh()
        }
        setSavingId(null)
    }

    const handleRemove = async (row: UserRole) => {
        if (!confirm("Remove this role?")) return
        const deleteQuery = supabase.from("user_roles").delete()
        const { error } = await deleteQuery.eq("user_id", row.user_id)
        if (error) {
            toast.error("Failed to remove role", { description: error.message })
            return
        }
        toast.success("Role removed")
        router.refresh()
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">Roles</h1>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-2">
                <div className="relative w-full sm:w-72">
                    <Input
                        placeholder="Search users..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="rounded-md border border-border bg-card overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted text-muted-foreground">
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Admin</TableHead>
                            <TableHead>Permissions</TableHead>
                            <TableHead>Scope</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredRoles.map((row) => {
                            const isDirty = dirty[row.user_id]
                            const scopeValue = row.scope_finds && row.scope_girls
                                ? "both"
                                : row.scope_finds
                                    ? "finds"
                                    : "girls"
                            return (
                                <TableRow key={row.user_id}>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-foreground">
                                                {row.email || "No email"}
                                            </span>
                                            <span className="text-xs text-muted-foreground">{row.user_id}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <select
                                            className="h-9 w-24 rounded-md border border-input bg-background px-2 text-sm"
                                            value={row.role === "admin" ? "admin" : "none"}
                                            onChange={(e) => {
                                                const nextRole = e.target.value === "admin" ? "admin" : null
                                                setRoles((prev) =>
                                                    prev.map((r) => {
                                                        if (r.user_id !== row.user_id) return r
                                                        if (nextRole === "admin") {
                                                            return {
                                                                ...r,
                                                                role: "admin",
                                                                can_add: true,
                                                                can_edit: true,
                                                                can_remove: true,
                                                                scope_finds: true,
                                                                scope_girls: true,
                                                            }
                                                        }
                                                        return { ...r, role: null }
                                                    })
                                                )
                                                setDirty((prev) => ({ ...prev, [row.user_id]: true }))
                                            }}
                                        >
                                            <option value="none">None</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-3">
                                            <label className="flex items-center gap-2 text-sm">
                                                <input
                                                    type="checkbox"
                                                    checked={!!row.can_add}
                                                    onChange={(e) => updatePermission(row.user_id, "can_add", e.target.checked)}
                                                    className="h-4 w-4"
                                                />
                                                Adding
                                            </label>
                                            <label className="flex items-center gap-2 text-sm">
                                                <input
                                                    type="checkbox"
                                                    checked={!!row.can_edit}
                                                    onChange={(e) => updatePermission(row.user_id, "can_edit", e.target.checked)}
                                                    className="h-4 w-4"
                                                />
                                                Editing
                                            </label>
                                            <label className="flex items-center gap-2 text-sm">
                                                <input
                                                    type="checkbox"
                                                    checked={!!row.can_remove}
                                                    onChange={(e) => updatePermission(row.user_id, "can_remove", e.target.checked)}
                                                    className="h-4 w-4"
                                                />
                                                Removing
                                            </label>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <select
                                            className="h-9 w-36 rounded-md border border-input bg-background px-2 text-sm"
                                            value={scopeValue}
                                            onChange={(e) => updateScope(row.user_id, e.target.value as "both" | "finds" | "girls")}
                                        >
                                            <option value="both">Finds + Girls</option>
                                            <option value="finds">Finds only</option>
                                            <option value="girls">Girls only</option>
                                        </select>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                size="sm"
                                                variant={isDirty ? "default" : "outline"}
                                                disabled={!isDirty || savingId === row.user_id}
                                                onClick={() => handleSave(row)}
                                            >
                                                {savingId === row.user_id ? "Saving..." : "Save"}
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="text-red-500 hover:text-red-600"
                                                onClick={() => handleRemove(row)}
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                        {filteredRoles.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center text-muted-foreground">
                                    No users found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
