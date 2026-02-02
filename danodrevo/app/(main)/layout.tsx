import type React from "react"

export default function MainLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <div className="mx-auto w-full max-w-[1920px] px-4 pb-12 sm:px-8 sm:pb-16">
            {children}
        </div>
    )
}
