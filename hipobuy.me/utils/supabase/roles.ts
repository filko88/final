"use server"

import { createAdminClient } from "@/utils/supabase/admin"

export async function getUserRoleData(userId: string) {
    const admin = await createAdminClient()
    const { data, error } = await admin
        .from("user_roles")
        .select("role, can_add, can_edit, can_remove, scope_finds, scope_girls")
        .eq("user_id", userId)
        .single()

    if (error) {
        return null
    }

    return data
}
