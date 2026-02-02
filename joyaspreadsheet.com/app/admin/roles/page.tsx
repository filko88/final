import { createClient } from "@/utils/supabase/server"
import { createAdminClient } from "@/utils/supabase/admin"
import { getUserRoleData } from "@/utils/supabase/roles"
import { redirect } from "next/navigation"
import AdminRolesClient from "./AdminRolesClient"

export default async function AdminRolesPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login")
    }

    let { data: roleData } = await supabase
        .from("user_roles")
        .select("role, can_add, can_edit, can_remove, scope_finds, scope_girls")
        .eq("user_id", user.id)
        .single()

    if (!roleData) {
        roleData = await getUserRoleData(user.id)
    }

    if (!roleData) {
        redirect("/pending-approval")
    }

    if (roleData.role !== "admin") {
        redirect("/admin")
    }

    const { data: roles } = await supabase
        .from("user_roles")
        .select("*")
        .order("user_id", { ascending: true })

    const admin = await createAdminClient()
    const { data: usersData, error: usersError } = await admin.auth.admin.listUsers({
        perPage: 1000,
    })
    if (usersError) {
        throw usersError
    }

    const roleMap = new Map((roles || []).map((role) => [role.user_id, role]))
    const mergedRoles = (usersData?.users || []).map((user) => {
        const roleRow = roleMap.get(user.id)
        const isAdmin = roleRow?.role === "admin"
        return {
            id: roleRow?.id,
            user_id: user.id,
            email: user.email,
            role: roleRow?.role || null,
            can_add: isAdmin ? true : (roleRow?.can_add ?? false),
            can_edit: isAdmin ? true : (roleRow?.can_edit ?? false),
            can_remove: isAdmin ? true : (roleRow?.can_remove ?? false),
            scope_finds: isAdmin ? true : (roleRow?.scope_finds ?? true),
            scope_girls: isAdmin ? true : (roleRow?.scope_girls ?? true),
            created_at: roleRow?.created_at,
        }
    })

    return <AdminRolesClient initialRoles={mergedRoles} />
}
