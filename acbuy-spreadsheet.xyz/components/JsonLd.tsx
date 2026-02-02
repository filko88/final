import Script from 'next/script'

interface JsonLdProps {
  data: Record<string, unknown>
  id?: string
}

type JsonLdData = Record<string, unknown> & {
  "@type"?: string | string[]
}

export default function JsonLd({ data, id }: JsonLdProps) {
  const rawType = (data as JsonLdData)["@type"]
  const normalizedType = Array.isArray(rawType)
    ? rawType.join('-')
    : typeof rawType === 'string'
      ? rawType
      : 'generic'
  const scriptId = id ?? `json-ld-${normalizedType}`

  return (
    <Script
      id={scriptId}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data),
      }}
    />
  )
}

// Website structured data
export const websiteStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "acbuy-spreadsheet",
  "url": "https://acbuy-spreadsheet.xyz",
  "description": "Find the best rep links. Check QC, convert links and buy trough Kakobuy, Cnfans, Acbuy, Oopbuy.",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://acbuy-spreadsheet.xyz/finds?search={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}

// Organization structured data
export const organizationStructuredData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "acbuy-spreadsheet",
  "url": "https://acbuy-spreadsheet.xyz",
  "logo": "https://acbuy-spreadsheet.xyz/logo.png",
  "sameAs": [
    "https://twitter.com/acbuy-spreadsheet"
  ]
}

// Tool structured data
export const toolStructuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "acbuy-spreadsheet Tools",
  "description": "QC Checker and Link Converter for rep shopping",
  "url": "https://acbuy-spreadsheet.xyz/tools",
  "applicationCategory": "UtilityApplication",
  "operatingSystem": "Web Browser",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  }
} 