"use client"

import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarRail, SidebarInset, SidebarTrigger, SidebarGroup, SidebarGroupLabel, SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton } from "@/components/ui/sidebar"
import { LogOut, LayoutDashboard, User, Package, Store, Users } from "lucide-react"
import type { ReactNode } from "react"
import { createClient } from "@/utils/supabase/client"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default function AdminLayout({ children }: { children: ReactNode }) {
    const router = useRouter()
    const supabase = createClient()
    const [isAdmin, setIsAdmin] = useState(false)
    const pathname = usePathname()
    const [statusParam, setStatusParam] = useState("all")
    const isProductsPage = pathname === "/admin/products"
    const isGirlsPage = pathname === "/admin/girls"
    const section = pathname?.split("/")[2] || "dashboard"
    const titleMap: Record<string, string> = {
        dashboard: "Dashboard",
        products: "Products",
        girls: "Girls",
        sellers: "Sellers",
        categories: "Categories",
        roles: "Roles",
        creators: "Creators",
    }
    const pageTitle = titleMap[section] || "Admin"

    useEffect(() => {
        const checkRole = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.replace("/login")
                return
            }
            const { data } = await supabase
                .from('user_roles')
                .select('role, can_add, can_edit, can_remove, scope_finds, scope_girls')
                .eq('user_id', user.id)
                .single()
            if (!data) {
                setIsAdmin(false)
                return
            }
            setIsAdmin(data.role === "admin")
        }
        checkRole()
    }, [router, supabase])

    useEffect(() => {
        if (typeof window === "undefined") return
        const params = new URLSearchParams(window.location.search)
        setStatusParam(params.get("status") || "all")
    }, [pathname])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push("/login")
    }

    return (
        <SidebarProvider>
            <div className="flex min-h-svh w-full overflow-x-hidden">
                {/* App Sidebar */}
                <Sidebar>
                    <SidebarHeader className="px-3 py-4">
                        <div className="flex items-center gap-2">
                            <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                                CMS Panel
                            </span>
                        </div>
                    </SidebarHeader>

                    <SidebarContent>
                        <SidebarGroup>
                            <SidebarGroupLabel>Platform</SidebarGroupLabel>
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild>
                                        <a href="/admin">
                                            <LayoutDashboard />
                                            <span>Dashboard</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild>
                                        <a href="/admin/products">
                                            <Package />
                                            <span>Products</span>
                                        </a>
                                    </SidebarMenuButton>
                                    <SidebarMenuSub
                                        className={cn(
                                            "overflow-hidden transition-all duration-200 ease-out",
                                            isProductsPage ? "max-h-40 opacity-100" : "max-h-0 opacity-0 border-l-0 py-0 pointer-events-none"
                                        )}
                                    >
                                        <SidebarMenuSubItem>
                                            <SidebarMenuSubButton href="/admin/products" isActive={isProductsPage && statusParam === "all"}>
                                                <span>All</span>
                                            </SidebarMenuSubButton>
                                        </SidebarMenuSubItem>
                                        <SidebarMenuSubItem>
                                            <SidebarMenuSubButton href="/admin/products?status=draft" isActive={isProductsPage && statusParam === "draft"}>
                                                <span>Drafts</span>
                                            </SidebarMenuSubButton>
                                        </SidebarMenuSubItem>
                                        <SidebarMenuSubItem>
                                            <SidebarMenuSubButton href="/admin/products?status=published" isActive={isProductsPage && statusParam === "published"}>
                                                <span>Posted</span>
                                            </SidebarMenuSubButton>
                                        </SidebarMenuSubItem>
                                        <SidebarMenuSubItem>
                                            <SidebarMenuSubButton href="/admin/products?status=boosted" isActive={isProductsPage && statusParam === "boosted"}>
                                                <span>Boosted</span>
                                            </SidebarMenuSubButton>
                                        </SidebarMenuSubItem>
                                    </SidebarMenuSub>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild>
                                        <a href="/admin/girls">
                                            <Package />
                                            <span>Girls</span>
                                        </a>
                                    </SidebarMenuButton>
                                    <SidebarMenuSub
                                        className={cn(
                                            "overflow-hidden transition-all duration-200 ease-out",
                                            isGirlsPage ? "max-h-40 opacity-100" : "max-h-0 opacity-0 border-l-0 py-0 pointer-events-none"
                                        )}
                                    >
                                        <SidebarMenuSubItem>
                                            <SidebarMenuSubButton href="/admin/girls" isActive={isGirlsPage && statusParam === "all"}>
                                                <span>All</span>
                                            </SidebarMenuSubButton>
                                        </SidebarMenuSubItem>
                                        <SidebarMenuSubItem>
                                            <SidebarMenuSubButton href="/admin/girls?status=draft" isActive={isGirlsPage && statusParam === "draft"}>
                                                <span>Drafts</span>
                                            </SidebarMenuSubButton>
                                        </SidebarMenuSubItem>
                                        <SidebarMenuSubItem>
                                            <SidebarMenuSubButton href="/admin/girls?status=published" isActive={isGirlsPage && statusParam === "published"}>
                                                <span>Posted</span>
                                            </SidebarMenuSubButton>
                                        </SidebarMenuSubItem>
                                        <SidebarMenuSubItem>
                                            <SidebarMenuSubButton href="/admin/girls?status=boosted" isActive={isGirlsPage && statusParam === "boosted"}>
                                                <span>Boosted</span>
                                            </SidebarMenuSubButton>
                                        </SidebarMenuSubItem>
                                    </SidebarMenuSub>
                                </SidebarMenuItem>

                                {isAdmin && (
                                    <SidebarMenuItem>
                                        <SidebarMenuButton asChild>
                                            <a href="/admin/sellers">
                                                <Store />
                                                <span>Sellers</span>
                                            </a>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )}

                                {isAdmin && (
                                    <SidebarMenuItem>
                                        <SidebarMenuButton asChild>
                                            <a href="/admin/creators">
                                                <Users />
                                                <span>Creators</span>
                                            </a>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )}

                                {isAdmin && (
                                    <SidebarMenuItem>
                                        <SidebarMenuButton asChild>
                                            <a href="/admin/categories">
                                                <Package />
                                                <span>Categories</span>
                                            </a>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )}

                                {isAdmin && (
                                    <SidebarMenuItem>
                                        <SidebarMenuButton asChild>
                                            <a href="/admin/roles">
                                                <User />
                                                <span>Roles</span>
                                            </a>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )}
                            </SidebarMenu>
                        </SidebarGroup>
                    </SidebarContent>

                    <SidebarFooter>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton onClick={handleLogout}>
                                    <LogOut />
                                    <span>Sign Out</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarFooter>
                    <SidebarRail />
                </Sidebar>

                {/* Main Content Area */}
                <SidebarInset className="min-w-0">
                    <header className="flex h-14 sm:h-16 shrink-0 items-center gap-2 border-b px-3 sm:px-4">
                        <SidebarTrigger className="-ml-1" />
                        <div className="h-4 w-px bg-border mx-2" />
                        <span className="min-w-0 truncate text-sm sm:text-base font-medium">{pageTitle}</span>
                    </header>
                    <div className="flex flex-1 flex-col gap-4 p-3 sm:p-4">
                        <div className="w-full min-w-0 max-w-screen-2xl mx-auto">
                            {children}
                        </div>
                    </div>
                </SidebarInset>
            </div>
        </SidebarProvider >
    )
}
