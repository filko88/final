"use client"

import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    XAxis,
} from "recharts"
import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type TrendDatum = {
    period: string
    items: number
}

type ActivityDatum = {
    period: string
    added: number
    updated: number
    deleted: number
}

interface DashboardInsightsProps {
    trendData: TrendDatum[]
    activityData: ActivityDatum[]
}

const trendConfig = {
    items: {
        label: "Items added",
        color: "hsl(var(--chart-1))",
    },
}

const activityConfig = {
    added: {
        label: "Added",
        color: "hsl(var(--chart-2))",
    },
    updated: {
        label: "Updated",
        color: "hsl(var(--chart-3))",
    },
    deleted: {
        label: "Deleted",
        color: "hsl(var(--chart-4))",
    },
}

export function DashboardInsights({ trendData, activityData }: DashboardInsightsProps) {
    return (
        <div className="grid gap-4 lg:grid-cols-2">
            <Card className="border-border/60 bg-card shadow-sm min-w-0 overflow-hidden">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Item adding</CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer id="admin-trend" config={trendConfig} className="h-[220px] sm:h-[240px] w-full min-w-0 aspect-auto">
                        <AreaChart data={trendData} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
                            <CartesianGrid vertical={false} strokeDasharray="3 3" />
                            <XAxis dataKey="period" tickLine={false} axisLine={false} />
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent indicator="line" />}
                            />
                            <Area
                                type="monotone"
                                dataKey="items"
                                stroke="var(--color-items)"
                                fill="var(--color-items)"
                                fillOpacity={0.18}
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            <Card className="border-border/60 bg-card shadow-sm min-w-0 overflow-hidden">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Activity mix</CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer id="admin-activity" config={activityConfig} className="h-[220px] sm:h-[240px] w-full min-w-0 aspect-auto">
                        <BarChart data={activityData} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
                            <CartesianGrid vertical={false} strokeDasharray="3 3" />
                            <XAxis dataKey="period" tickLine={false} axisLine={false} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <ChartLegend content={<ChartLegendContent />} />
                            <Bar dataKey="added" fill="var(--color-added)" radius={[6, 6, 0, 0]} />
                            <Bar dataKey="updated" fill="var(--color-updated)" radius={[6, 6, 0, 0]} />
                            <Bar dataKey="deleted" fill="var(--color-deleted)" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
    )
}
