"use client"

import Link from "next/link"

interface LogoProps {
  className?: string
}

export default function Logo({ className }: LogoProps) {
  return (
    <Link href="/">
      <div className={className ? className : "flex items-center"} suppressHydrationWarning>
        <span className="text-lg sm:text-xl font-bold text-white dark:text-white">rep-finds.com</span>
      </div>
    </Link>
  )
}


