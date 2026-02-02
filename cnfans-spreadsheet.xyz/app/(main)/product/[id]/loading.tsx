export default function Loading() {
  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.18),_transparent_55%)]" />
        <div className="absolute right-0 top-0 h-72 w-72 -translate-y-24 translate-x-16 rounded-full bg-gradient-to-br from-foreground/10 via-foreground/5 to-transparent blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-[1920px] px-4 pb-16 pt-6 sm:px-8 sm:pt-10">
        <section className="relative overflow-hidden rounded-3xl border border-foreground/10 bg-background/70 p-6 sm:p-10 backdrop-blur-lg shadow-[0_18px_40px_-30px_rgba(15,23,42,0.6)]">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-foreground/10 to-transparent" />
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-10 rounded-full bg-foreground/10 animate-pulse" />
                <div className="h-3 w-3 rounded-full bg-foreground/10 animate-pulse" />
                <div className="h-3 w-12 rounded-full bg-foreground/10 animate-pulse" />
                <div className="h-3 w-3 rounded-full bg-foreground/10 animate-pulse" />
                <div className="h-3 w-28 rounded-full bg-foreground/10 animate-pulse" />
              </div>
              <div className="h-10 w-[70%] rounded-2xl bg-foreground/10 animate-pulse" />
            </div>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-foreground/10 animate-pulse" />
            </div>
          </div>
        </section>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 flex flex-col gap-6">
            <div className="relative overflow-hidden rounded-3xl border border-foreground/10 bg-background/70 shadow-lg backdrop-blur-lg">
              <div className="aspect-square bg-foreground/5 animate-pulse" />
            </div>
          </div>

          <div className="lg:col-span-6 flex flex-col gap-6">
            <div className="rounded-3xl border border-foreground/10 bg-background/70 p-6 backdrop-blur-lg shadow-[0_16px_32px_-28px_rgba(15,23,42,0.6)]">
              <div className="flex items-center justify-between">
                <div className="h-4 w-28 rounded-full bg-foreground/10 animate-pulse" />
                <div className="h-6 w-28 rounded-full bg-foreground/10 animate-pulse" />
              </div>
              <div className="mt-4 flex items-end justify-between gap-4">
                <div className="h-12 w-36 rounded-full bg-foreground/10 animate-pulse" />
              </div>
              <div className="mt-4">
                <div className="h-9 w-40 rounded-full bg-foreground/10 animate-pulse" />
              </div>
            </div>

            <div className="rounded-3xl border border-foreground/10 bg-background/70 p-6 backdrop-blur-lg shadow-[0_16px_32px_-28px_rgba(15,23,42,0.6)]">
              <div className="h-6 w-32 rounded-full bg-foreground/10 animate-pulse mb-4" />
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="aspect-square rounded-2xl bg-foreground/10 animate-pulse" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
