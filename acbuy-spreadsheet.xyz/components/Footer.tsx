"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import Logo from "@/components/Logo"
import { getPageDescription } from "@/lib/pageDescription"

export default function Footer() {
  const pathname = usePathname()

  const pageDescription = getPageDescription(pathname)

  return (
    <footer className="border-t border-white/10 dark:border-white/10 border-zinc-200 bg-dark-bg dark:bg-dark-bg bg-white" suppressHydrationWarning>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16" suppressHydrationWarning>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12" suppressHydrationWarning>
          <div className="lg:col-span-1 text-center lg:text-left" suppressHydrationWarning>
            <Logo className="flex items-center justify-center lg:justify-start" />
            <p className="mt-4 text-zinc-400 max-w-xs mx-auto lg:mx-0 text-sm sm:text-base dark:text-zinc-400 text-zinc-800">
              {pageDescription}
            </p>
          </div>
          
          <div className="text-center sm:text-left">
            <h4 className="font-semibold text-white mb-3 sm:mb-4 text-sm sm:text-base dark:text-white text-zinc-900">Pages</h4>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <Link href="/finds" className="text-zinc-400 hover:text-white transition-colors text-sm sm:text-base dark:text-zinc-400 dark:hover:text-white text-zinc-600 hover:text-zinc-900">
                  Finds
                </Link>
              </li>
              <li>
                <Link href="/sellers" className="text-zinc-400 hover:text-white transition-colors text-sm sm:text-base dark:text-zinc-400 dark:hover:text-white text-zinc-600 hover:text-zinc-900">
                  Sellers
                </Link>
              </li>
              <li>
                <Link href="/tools" className="text-zinc-400 hover:text-white transition-colors text-sm sm:text-base dark:text-zinc-400 dark:hover:text-white text-zinc-600 hover:text-zinc-900">
                  Tools
                </Link>
              </li>
              <li>
                <Link href="/tutorials" className="text-zinc-400 hover:text-white transition-colors text-sm sm:text-base dark:text-zinc-400 dark:hover:text-white text-zinc-600 hover:text-zinc-900">
                  Tutorials
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="text-center sm:text-left">
            <h4 className="font-semibold text-white mb-3 sm:mb-4 text-sm sm:text-base dark:text-white text-zinc-900">Socials</h4>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <Link href="#" className="text-zinc-400 hover:text-white transition-colors text-sm sm:text-base dark:text-zinc-400 dark:hover:text-white text-zinc-600 hover:text-zinc-900">
                  Instagram
                </Link>
              </li>
              <li>
                <Link href="#" className="text-zinc-400 hover:text-white transition-colors text-sm sm:text-base dark:text-zinc-400 dark:hover:text-white text-zinc-600 hover:text-zinc-900">
                  TikTok
                </Link>
              </li>
              <li>
                <Link href="#" className="text-zinc-400 hover:text-white transition-colors text-sm sm:text-base dark:text-zinc-400 dark:hover:text-white text-zinc-600 hover:text-zinc-900">
                  Discord
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 sm:mt-12 lg:mt-16 pt-6 sm:pt-8 border-t border-white/10 dark:border-white/10 border-zinc-200">
          <p className="text-xs sm:text-sm text-zinc-500 text-center dark:text-zinc-500 text-zinc-700">
            &copy; {new Date().getFullYear()} acbuy-spreadsheet. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
} 