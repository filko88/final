"use client"

import { createContext, useContext, ReactNode } from 'react'

type Language = 'en'

interface LanguageContextType {
  language: Language
  setLanguage: (language: Language) => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const setLanguage = () => {}
  return (
    <LanguageContext.Provider value={{ language: 'en', setLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }

  return {
    ...context,
    isSk: false,
  }
}
