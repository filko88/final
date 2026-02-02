export default function LinksLayout({ children }: { children: React.ReactNode }) {
  return (
    <div suppressHydrationWarning>
      <style>{`
        header, footer { display: none !important; }
        body { padding-top: 0 !important; }
      `}</style>
      {children}
    </div>
  )
}


