import { createClient } from '@/utils/supabase/server'
import { getUserRoleData } from '@/utils/supabase/roles'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { DashboardMetrics } from './components/DashboardMetrics'
import { DashboardInsights } from '@/app/admin/components/DashboardInsights'

export default async function AdminDashboardPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    let { data: roleData } = await supabase
        .from('user_roles')
        .select('role, can_add, can_edit, can_remove')
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

    // Fetch Metrics
    const { count: productCount } = await supabase
        .from('finds')
        .select('*', { count: 'exact', head: true })

    // Categories are stored as columns category_0, category_1 etc. 
    // Getting unique categories is tricky without an aggregate function or separate table. 
    // For now, let's just count distinct categories from a sample or use a fixed number if expensive.
    // Actually, let's try a distinct fetch on category_0
    const { data: categories } = await supabase
        .from('finds')
        .select('category_0')

    // Calculate unique categories locally for now (not efficient for huge datasets but fine for <10k)
    const uniqueCategories = new Set(categories?.map(c => c.category_0).filter(Boolean)).size

    const totalProducts = productCount || 0
    const totalCategories = uniqueCategories || 0
    const totalSellers = 0 // Placeholder

    const roleLabel = roleData.role === "admin"
        ? "admin"
        : roleData.can_edit
            ? "editor"
            : roleData.can_add
                ? "contributor"
                : roleData.can_remove
                    ? "moderator"
                    : "user"

    const roleMeta = {
        admin: {
            title: "Overview",
            subtitle: "Full access across catalog, sellers, and ops.",
            quickActions: [
                { href: "/admin/products", label: "Products", description: "Review listings and update details." },
                { href: "/admin/categories", label: "Categories", description: "Keep category tags organized." },
                { href: "/admin/sellers", label: "Sellers", description: "Verify and support sellers." },
                { href: "/admin/roles", label: "Roles", description: "Update access and permissions." },
            ],
        },
        editor: {
            title: "Editorial Desk",
            subtitle: "Curate quality and polish live listings.",
            quickActions: [
                { href: "/admin/products", label: "Review products", description: "Audit accuracy and improve copy." },
                { href: "/admin/categories", label: "Categories", description: "Adjust taxonomy for clarity." },
                { href: "/admin/products", label: "Drafts", description: "Finish and publish pending items." },
                { href: "/admin/sellers", label: "Sellers", description: "Coordinate with verified shops." },
            ],
        },
        contributor: {
            title: "Contributor Queue",
            subtitle: "Add and organize new product finds.",
            quickActions: [
                { href: "/admin/products", label: "Add products", description: "Create and publish new finds." },
                { href: "/admin/categories", label: "Categories", description: "Select the right category tags." },
                { href: "/admin/products", label: "Boost order", description: "Prioritize top listings." },
                { href: "/admin/sellers", label: "Sellers", description: "Attach trusted seller info." },
            ],
        },
        moderator: {
            title: "Moderation Hub",
            subtitle: "Keep the catalog safe and consistent.",
            quickActions: [
                { href: "/admin/products", label: "Flagged items", description: "Remove or correct violations." },
                { href: "/admin/products", label: "Quality checks", description: "Confirm images and pricing." },
                { href: "/admin/categories", label: "Category fixes", description: "Resolve miscategorized items." },
                { href: "/admin/sellers", label: "Seller audits", description: "Review compliance quickly." },
            ],
        },
        user: {
            title: "Workspace",
            subtitle: "Limited access. Ask an admin for changes.",
            quickActions: [
                { href: "/admin/products", label: "Browse products", description: "View catalog details." },
                { href: "/admin/sellers", label: "Browse sellers", description: "Check seller profiles." },
                { href: "/admin/categories", label: "View categories", description: "Explore taxonomy." },
                { href: "/admin/roles", label: "Request access", description: "Ask for higher permissions." },
            ],
        },
    } as const

    const keepFreshCopy = {
        admin: "Keep listings fresh, accurate, and conversion-ready.",
        editor: "Polish listings to keep quality at a high standard.",
        contributor: "Ship clean listings with complete details.",
        moderator: "Protect quality by catching issues early.",
        user: "Need more access? Reach out to an admin.",
    } as const

    const hero = roleMeta[roleLabel]
    const keepFreshMessage = keepFreshCopy[roleLabel]

    const weeks = 6
    const msPerWeek = 7 * 24 * 60 * 60 * 1000
    const now = new Date()
    const startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
    startDate.setUTCDate(startDate.getUTCDate() - (weeks - 1) * 7)

    const formatWeekLabel = (date: Date) => {
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        return `${monthNames[date.getUTCMonth()]} ${date.getUTCDate()}`
    }

    const weekStarts = Array.from({ length: weeks }, (_, i) => {
        const date = new Date(startDate)
        date.setUTCDate(startDate.getUTCDate() + i * 7)
        return date
    })

    const createdByWeek = Array(weeks).fill(0)
    const updatedByWeek = Array(weeks).fill(0)
    const deletedByWeek = Array(weeks).fill(0)

    type ActivityRow = {
        created_at?: string | null
        updated_at?: string | null
        deleted_at?: string | null
    }

    const { data: activityRows, error: activityError } = await supabase
        .from("finds")
        .select("created_at, updated_at, deleted_at")
        .or(`created_at.gte.${startDate.toISOString()},updated_at.gte.${startDate.toISOString()},deleted_at.gte.${startDate.toISOString()}`)

    let safeActivityRows: ActivityRow[] | null = activityRows
    if (activityError) {
        const { data: fallbackRows } = await supabase
            .from("finds")
            .select("created_at, updated_at")
            .or(`created_at.gte.${startDate.toISOString()},updated_at.gte.${startDate.toISOString()}`)
        safeActivityRows = fallbackRows as ActivityRow[] | null
    }

    safeActivityRows?.forEach((row) => {
        if (row.created_at) {
            const createdAt = new Date(row.created_at)
            const index = Math.floor((createdAt.getTime() - startDate.getTime()) / msPerWeek)
            if (index >= 0 && index < weeks) {
                createdByWeek[index] += 1
            }
        }

        if (row.updated_at) {
            const updatedAt = new Date(row.updated_at)
            const index = Math.floor((updatedAt.getTime() - startDate.getTime()) / msPerWeek)
            if (index >= 0 && index < weeks) {
                updatedByWeek[index] += 1
            }
        }

        if ("deleted_at" in row && row.deleted_at) {
            const deletedAt = new Date(row.deleted_at)
            const index = Math.floor((deletedAt.getTime() - startDate.getTime()) / msPerWeek)
            if (index >= 0 && index < weeks) {
                deletedByWeek[index] += 1
            }
        }
    })

    const trendData = weekStarts.map((date, index) => ({
        period: formatWeekLabel(date),
        items: createdByWeek[index] || 0,
    }))

    const activityData = weekStarts.map((date, index) => ({
        period: formatWeekLabel(date),
        added: createdByWeek[index] || 0,
        updated: updatedByWeek[index] || 0,
        deleted: deletedByWeek[index] || 0,
    }))

    return (
        <div className="flex flex-col gap-8">
            <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-slate-950/5 via-card to-card px-6 py-6 shadow-sm">
                <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-16 -left-10 h-36 w-36 rounded-full bg-emerald-500/10 blur-3xl" />
                <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Dashboard</p>
                        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                            Welcome{user.email ? `, ${user.email}` : ""}.
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {hero.title} • {hero.subtitle}
                        </p>
                    </div>
                    <div className="rounded-full border border-border/70 bg-background/80 px-4 py-2 text-sm text-muted-foreground shadow-sm">
                        {keepFreshMessage}
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-foreground">Overview</h2>
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">Live stats</span>
                </div>
                <DashboardMetrics
                    totalProducts={totalProducts}
                    totalCategories={totalCategories}
                    totalSellers={totalSellers}
                />
            </div>

            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-foreground">Insights</h2>
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">Last 6 weeks</span>
                </div>
                <DashboardInsights trendData={trendData} activityData={activityData} />
            </div>

            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-foreground">Focus board</h2>
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">Your scope</span>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {hero.quickActions.map((action) => (
                        <Link
                            key={action.label}
                            href={action.href}
                            className="group rounded-2xl border border-border/70 bg-card px-5 py-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                        >
                            <div className="text-sm font-medium text-foreground">{action.label}</div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {action.description}
                            </p>
                            <span className="mt-3 inline-flex text-xs font-medium text-primary">
                                Open
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}
