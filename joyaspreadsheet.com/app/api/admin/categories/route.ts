import { NextResponse } from "next/server"
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
  const { data: roleData, error } = await admin
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .single()

  const fallbackRole = !roleData && !error ? null : roleData ?? (await getUserRoleData(user.id))

  if (!fallbackRole || fallbackRole.role !== "admin") {
    return { ok: false as const, status: 403, message: "Forbidden" }
  }

  return { ok: true as const, admin }
}

export async function POST(request: Request) {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status })
  }

  const body = await request.json()
  const { name, parent_id, sort_order } = body ?? {}

  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "Name is required" }, { status: 400 })
  }

  const { error } = await auth.admin
    .from("categories")
    .insert({
      name: name.trim(),
      parent_id: parent_id ?? null,
      sort_order: typeof sort_order === "number" ? sort_order : 0,
    })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}

export async function PATCH(request: Request) {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status })
  }

  const body = await request.json()
  const { id, name, parent_id, sort_order } = body ?? {}

  if (!id) {
    return NextResponse.json({ error: "Category id is required" }, { status: 400 })
  }

  const updatePayload: Record<string, unknown> = {}
  if (typeof name === "string") updatePayload.name = name.trim()
  if (typeof parent_id !== "undefined") updatePayload.parent_id = parent_id ?? null
  if (typeof sort_order === "number") updatePayload.sort_order = sort_order

  const { error } = await auth.admin
    .from("categories")
    .update(updatePayload)
    .eq("id", id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(request: Request) {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status })
  }

  const body = await request.json()
  const { id } = body ?? {}

  if (!id) {
    return NextResponse.json({ error: "Category id is required" }, { status: 400 })
  }

  const { error } = await auth.admin.from("categories").delete().eq("id", id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}
