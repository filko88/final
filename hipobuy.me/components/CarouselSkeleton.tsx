import { Skeleton } from "@/components/ui/skeleton"

interface CarouselSkeletonProps {
  title?: string
}

export default function CarouselSkeleton({ title }: CarouselSkeletonProps) {
  return (
    <div className="w-full py-3 sm:py-4 md:py-6 min-h-[260px] sm:min-h-[300px] md:min-h-[340px]">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        {title ? (
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">{title}</h2>
        ) : (
          <Skeleton className="h-6 w-40 bg-white/10 dark:bg-white/10 bg-zinc-200" />
        )}
        <Skeleton className="h-4 w-16 rounded-full bg-white/10 dark:bg-white/10 bg-zinc-200" />
      </div>

      <div className="flex gap-2 sm:gap-3 md:gap-4 overflow-visible py-2 -my-2">
        {[1, 2, 3, 4, 5, 6].map((index) => (
          <div
            key={index}
            className="flex-shrink-0 w-[42%] xs:w-[38%] sm:w-[32%] md:w-[28%] lg:w-[23%] xl:w-[19%] 2xl:w-[16%] min-w-[140px] max-w-[220px]"
          >
            <div className="group block h-full">
              <div className="relative flex h-full flex-col overflow-hidden rounded-lg border border-foreground/10 bg-card p-2.5 shadow-sm">
                <div className="relative flex h-full flex-col gap-2">
                  <div className="relative aspect-square overflow-hidden rounded-md border border-foreground/10 bg-foreground/5">
                    <Skeleton className="h-full w-full rounded-md bg-foreground/10" />
                  </div>
                  <div className="relative flex flex-1 flex-col gap-1">
                    <Skeleton className="h-5 w-5/6 bg-foreground/10" />
                    <Skeleton className="h-5 w-1/3 bg-foreground/10" />
                    <div className="mt-auto flex items-center gap-2 pt-1">
                      <Skeleton className="h-7 w-16 rounded-full bg-foreground/10" />
                      <Skeleton className="h-7 flex-1 rounded-full bg-foreground/10" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

