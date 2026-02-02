import { createClient } from '@/utils/supabase/server'
import { getUserRoleData } from '@/utils/supabase/roles'
import { redirect } from 'next/navigation'
import GirlsClient from './GirlsClient'

export default async function GirlsPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch user role
    let { data: roleData } = await supabase
        .from('user_roles')
        .select('role, can_add, can_edit, can_remove, scope_finds, scope_girls')
        .eq('user_id', user.id)
        .single()

    if (!roleData) {
        roleData = await getUserRoleData(user.id)
    }

    if (!roleData) {
        redirect('/pending-approval')
    }

    const hasAccess = roleData.role === "admin" || !!(roleData.can_add || roleData.can_edit || roleData.can_remove)
    if (!hasAccess) {
        redirect('/pending-approval')
    }

    const permissions = {
        canAdd: roleData.role === "admin" ? true : !!roleData.can_add,
        canEdit: roleData.role === "admin" ? true : !!roleData.can_edit,
        canRemove: roleData.role === "admin" ? true : !!roleData.can_remove,
        scopeFinds: roleData.role === "admin" ? true : (roleData.scope_finds ?? true),
        scopeGirls: roleData.role === "admin" ? true : (roleData.scope_girls ?? true),
    }

    //  Fetch all girls
    const { data: items } = await supabase
        .from('girls')
        .select('*')
        .order('sort_order', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false })

    // Basic normalization for the client component
    const normalizedItems = (items || []).map((item: any) => ({
        _id: item.id,
        name: item.name,
        price: Number(item.price),
        image: item.image,
        link: item.link,
        rawUrl: item.link,
        marketplace: item.marketplace,
        agentLinks: item.agent_links || {},
        "category[0]": item.category_0,
        "category[1]": item.category_1,
        "category[2]": item.category_2,
        brand: item.brand || "Generic",
        batch: item.batch,
        view_count: item.view_count || 0,
        created_by: item.temp_created_by,
        created_at: item.created_at,
        updated_at: item.updated_at,
        top: item.top,
        status: item.status,
        boost_order: item.boost_order || 0,
        sort_order: item.sort_order || 0
    }))

    return <GirlsClient items={normalizedItems} userEmail={user.email} permissions={permissions} />
}
