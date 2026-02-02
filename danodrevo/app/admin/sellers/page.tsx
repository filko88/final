import { createClient } from '@/utils/supabase/server'
import { getUserRoleData } from '@/utils/supabase/roles'
import { redirect } from 'next/navigation'
import AdminSellersClient from './AdminSellersClient'

export default async function AdminSellersPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch user role
    let { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single()

    if (!roleData) {
        roleData = await getUserRoleData(user.id)
    }

    if (!roleData) {
        redirect('/pending-approval')
    }

    if (roleData.role !== 'admin') {
        redirect('/admin')
    }

    // Fetch all sellers
    const { data: sellers } = await supabase
        .from('sellers')
        .select('*')
        .order('created_at', { ascending: false })

    return <AdminSellersClient initialSellers={sellers || []} />
}
