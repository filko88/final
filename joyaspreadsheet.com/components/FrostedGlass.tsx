"use client"

interface RoundedProps {
  roundedClass?: string
}

export function FrostedGlassBackground({ roundedClass }: RoundedProps) {
  return (
    <div className={`absolute inset-0 bg-[#040102]/80 backdrop-blur-2xl backdrop-saturate-150 dark:bg-[#040102]/80 bg-white/80 ${roundedClass ? roundedClass : ""}`} suppressHydrationWarning />
  )
}

export function FrostedGradientOverlay({ roundedClass }: RoundedProps) {
  return (
    <div className={`absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/10 dark:from-white/10 dark:to-black/10 ${roundedClass ? roundedClass : ""}`} suppressHydrationWarning />
  )
}

export function BottomHairline() {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-px bg-white/20 dark:bg-white/20" suppressHydrationWarning />
  )
}

export function FrostedPanelBackground() {
  return (
    <>
      <FrostedGlassBackground roundedClass="rounded-lg" />
      <FrostedGradientOverlay roundedClass="rounded-lg" />
      <div className="absolute inset-0 border border-white/20 dark:border-white/20 rounded-lg" />
    </>
  )
}


