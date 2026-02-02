import { createClient } from "@/utils/supabase/server"
import { createAdminClient } from "@/utils/supabase/admin"
import { getUserRoleData } from "@/utils/supabase/roles"
import { redirect } from "next/navigation"
import CreatorsClient from "./CreatorsClient"

export default async function CreatorsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  let { data: roleData } = await supabase
    .from("user_roles")
    .select("role")
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

  const adminSupabase = await createAdminClient()
  const { data: creators } = await adminSupabase
    .from("creators")
    .select("*")
    .order("id", { ascending: false })

  return <CreatorsClient initialCreators={creators || []} />
}
