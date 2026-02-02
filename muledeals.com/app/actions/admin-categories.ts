"use server"
import "server-only"

import { createClient } from "@/utils/supabase/server"
import { createAdminClient } from "@/utils/supabase/admin"
import { getUserRoleData } from "@/utils/supabase/roles"

async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { ok: false as const, status: 401, message: "Unauthorized" }
  }

  const admin = await createAdminClient()
  const { data: roleData, error } = await admin.from("user_roles").select("role").eq("user_id", user.id).single()
  const fallbackRole = !roleData && !error ? null : roleData ?? (await getUserRoleData(user.id))

  if (!fallbackRole || fallbackRole.role !== "admin") {
    return { ok: false as const, status: 403, message: "Forbidden" }
  }

  return { ok: true as const, admin }
}

export async function createCategory(payload: { name: string; parent_id?: number | null; sort_order?: number }) {
  const auth = await requireAdmin()
  if (!auth.ok) return { error: auth.message, status: auth.status }

  const name = payload.name?.trim()
  if (!name) return { error: "Name is required", status: 400 }

  const { error } = await auth.admin
    .from("categories")
    .insert({
      name,
      parent_id: payload.parent_id ?? null,
      sort_order: typeof payload.sort_order === "number" ? payload.sort_order : 0,
    })

  if (error) return { error: error.message, status: 400 }
  return { ok: true as const }
}

export async function updateCategory(payload: { id: number; name?: string; parent_id?: number | null; sort_order?: number }) {
  const auth = await requireAdmin()
  if (!auth.ok) return { error: auth.message, status: auth.status }

  if (!payload.id) return { error: "Category id is required", status: 400 }

  const updatePayload: Record<string, unknown> = {}
  if (typeof payload.name === "string") updatePayload.name = payload.name.trim()
  if (typeof payload.parent_id !== "undefined") updatePayload.parent_id = payload.parent_id ?? null
  if (typeof payload.sort_order === "number") updatePayload.sort_order = payload.sort_order

  const { error } = await auth.admin.from("categories").update(updatePayload).eq("id", payload.id)
  if (error) return { error: error.message, status: 400 }
  return { ok: true as const }
}

export async function deleteCategory(payload: { id: number }) {
  const auth = await requireAdmin()
  if (!auth.ok) return { error: auth.message, status: auth.status }

  if (!payload.id) return { error: "Category id is required", status: 400 }

  const { error } = await auth.admin.from("categories").delete().eq("id", payload.id)
  if (error) return { error: error.message, status: 400 }
  return { ok: true as const }
}
