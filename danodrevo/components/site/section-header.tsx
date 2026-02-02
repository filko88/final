import { cn } from "@/lib/utils"

type SectionHeaderProps = {
  eyebrow?: string
  title: string
  description?: string
  className?: string
}

export function SectionHeader({ eyebrow, title, description, className }: SectionHeaderProps) {
  return (
    <div className={cn("space-y-2 sm:space-y-3 text-left", className)}>
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
          {eyebrow}
        </p>
      )}
      <h2 className="text-xl font-semibold leading-tight text-foreground sm:text-2xl md:text-3xl">
        {title}
      </h2>
      {description && <p className="text-sm sm:text-base text-muted-foreground">{description}</p>}
    </div>
  )
}

