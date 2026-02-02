import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Tags, Users } from "lucide-react"

interface DashboardMetricsProps {
    totalProducts: number
    totalCategories: number
    totalSellers: number
}

export function DashboardMetrics({ totalProducts, totalCategories, totalSellers }: DashboardMetricsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-3">
            <Card className="group border-border/60 bg-gradient-to-br from-background to-muted/40 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                    <span className="rounded-full bg-primary/10 p-2 text-primary">
                        <Package className="h-4 w-4" />
                    </span>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalProducts}</div>
                    <p className="text-xs text-muted-foreground">
                        Across all categories
                    </p>
                </CardContent>
            </Card>
            <Card className="group border-border/60 bg-gradient-to-br from-background to-muted/40 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Categories</CardTitle>
                    <span className="rounded-full bg-emerald-500/10 p-2 text-emerald-600">
                        <Tags className="h-4 w-4" />
                    </span>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalCategories}</div>
                    <p className="text-xs text-muted-foreground">
                        Active product categories
                    </p>
                </CardContent>
            </Card>
            <Card className="group border-border/60 bg-gradient-to-br from-background to-muted/40 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Sellers</CardTitle>
                    <span className="rounded-full bg-violet-500/10 p-2 text-violet-600">
                        <Users className="h-4 w-4" />
                    </span>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalSellers}</div>
                    <p className="text-xs text-muted-foreground">
                        Registered verified sellers
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
