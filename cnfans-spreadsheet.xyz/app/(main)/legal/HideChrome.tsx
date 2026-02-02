"use client"

export default function HideChrome() {
  return (
    <style jsx global>{`
      header, footer { display: none !important; }
      body { padding-top: 0 !important; }
    `}</style>
  )
}


