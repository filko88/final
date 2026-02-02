import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { Inter } from "next/font/google"
import { siteConfig } from "@/config/site"
import { buildThemeCSSVariables } from "@/lib/theme"
import { getPageMetadata } from "@/lib/page-metadata"
import { ThemeProvider } from "@/components/theme-provider"
import { PreferencesProvider } from "@/hooks/use-preferences"
import { LanguageProvider } from "@/components/LanguageProvider"
import { AppHeader } from "@/components/site/header"
import { FooterModern } from "@/components/site/footer-modern"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "@/components/ui/sonner"
import HideOnAdmin from "@/components/HideOnAdmin"
import MainContainer from "@/components/MainContainer"
import GoogleAnalytics from "@/components/GoogleAnalytics"
import MicrosoftClarity from "@/components/MicrosoftClarity"
import DiscordFab from "@/components/DiscordFab"
import JsonLd, { organizationStructuredData, websiteStructuredData } from "@/components/JsonLd"

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

export const metadata: Metadata = {
  ...getPageMetadata("home"),
  icons: {
    icon: "/images/logo.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <JsonLd data={websiteStructuredData} />
        <JsonLd data={organizationStructuredData} />
        <GoogleAnalytics />
      </head>
      <body
        className={`${fontSans.variable} bg-background text-foreground antialiased overflow-x-hidden`}
        style={buildThemeCSSVariables(siteConfig)}
        suppressHydrationWarning
      >
        <PreferencesProvider>
          <LanguageProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem={false}
              disableTransitionOnChange
            >
              <div className="relative min-h-screen flex flex-col overflow-x-hidden bg-background text-foreground">
                <HideOnAdmin>
                  <AppHeader />
                </HideOnAdmin>
                <MainContainer>{children}</MainContainer>
                <HideOnAdmin>
                  <FooterModern />
                  <DiscordFab />
                </HideOnAdmin>
              </div>
              <Toaster />
              <SonnerToaster />
              <MicrosoftClarity projectId="sk94uqv57k" />
            </ThemeProvider>
          </LanguageProvider>
        </PreferencesProvider>
      </body>
    </html>
  )
}
