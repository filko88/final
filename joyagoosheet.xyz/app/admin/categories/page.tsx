import { createClient } from '@/utils/supabase/server'
import { getUserRoleData } from '@/utils/supabase/roles'
import { redirect } from 'next/navigation'
import CategoriesClient from './CategoriesClient'

export default async function CategoriesPage() {
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

    // Fetch all categories
    const { data: categories } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true })

    return <CategoriesClient categories={categories || []} />
}
