import { Skeleton } from "@/components/ui/skeleton"

export function ProductGridSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-64" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-foreground/5 bg-foreground/5 p-4 shadow-sm"
          >
            <Skeleton className="mb-4 h-40 w-full rounded-xl" />
            <Skeleton className="mb-2 h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  )
}

