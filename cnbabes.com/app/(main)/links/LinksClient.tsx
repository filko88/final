"use client"

import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Instagram, Music2, Youtube, Mail } from "lucide-react"
// Language feature disabled - keeping English only
// import { useLanguage } from "@/components/LanguageProvider"

export default function LinksClient({ initialIsSk: _ }: { initialIsSk: boolean }) {
  // Language feature disabled - keeping English only
  // const { isSk, setLanguage } = useLanguage()

  // useEffect(() => {
  //   const urlParams = new URLSearchParams(window.location.search)
  //   const hasSkParam = urlParams.has('sk')
  //   if (hasSkParam) {
  //     setLanguage('sk')
  //   }
  // }, [setLanguage])

  const t = {
    handle: "@PETER.REP",
    bio: "In love w reps since 2020, marketing specialist, web developer.",
    kakobuy: "KAKOBUY REGISTRATION",
    kakobuySub: "Register to get $410 in shipping coupons",
    coupon: 'Use coupon "peter" to get $15 balance',
    repFinds: "cnbabes.com",
    repFindsSub: "Where i have all my items from",
    chromeExtension: "CNBabes CHROME EXTENSION",
    chromeExtensionSub: "See more product info and QC photos",
    websiteDev: "WEBSITE DEVELOPMENT",
    websiteDevSub: "Developed cnbabes.com and many more",
    websiteDevBadge: "Premium experience",
    discord: "JOIN OUR DISCORD",
    discordSub: "Connect with the rep community",
    discordBadge: "REP CENTRAL",
    phyllisWatch: "PHYLLIS WATCH",
    phyllisWatchSub: "Luxury watches & accessories",
    phyllisWatchBadge: 'Use coupon "peter" for massive discount',
  }

  return (
    <div className="min-h-screen bg-[#000] text-white relative overflow-hidden">
      {/* Background wave image */}
      <div className="absolute inset-0 z-0 opacity-25">
        <img
          src="/images/hero/wave.png"
          alt="Background wave"
          className="w-full h-full object-cover"
        />
      </div>
      {/* Center brand glow */}
      <div className="absolute left-1/2 -translate-x-1/2 -top-16 w-[320px] sm:w-[420px] md:w-[520px] h-[220px] sm:h-[280px] md:h-[340px] bg-[rgba(223,29,72,0.45)] blur-[90px] rounded-full z-0" />
      {/* Subtle side glows */}
      <div className="absolute left-[12%] top-[28%] w-[180px] h-[120px] bg-[rgba(223,29,72,0.22)] blur-[70px] rounded-full hidden md:block z-0" />
      <div className="absolute right-[10%] top-[18%] w-[160px] h-[100px] bg-[rgba(223,29,72,0.18)] blur-[60px] rounded-full hidden md:block z-0" />

      <main className="relative z-10 mx-auto w-full max-w-md px-4 py-10">
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20">
            <Avatar className="w-20 h-20 rounded-full border-4 border-white/20">
              <AvatarImage src="https://cdn.discordapp.com/avatars/952810689012043808/258ceb5cbcffab1d2bc2f23beead491b.webp?size=160" alt="@peterep" />
              <AvatarFallback>PR</AvatarFallback>
            </Avatar>
            <img
              src="https://cdn.discordapp.com/avatar-decoration-presets/a_3c97a2d37f433a7913a1c7b7a735d000.png?size=240&passthrough=false"
              alt="Avatar decoration"
              className="absolute inset-0 w-full h-full pointer-events-none"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-wide uppercase">{t.handle}</h1>
            <p className="text-sm text-white/70">{t.bio}</p>
            <div className="mt-2 flex items-center gap-2">
              <Link href="https://tiktok.com/@peter.rep" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20">
                <Music2 className="w-4 h-4" />
              </Link>
              <Link href="https://instagram.com/peter.replicas" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20">
                <Instagram className="w-4 h-4" />
              </Link>
              <Link href="https://discord.gg/certifiedwarrior" target="_blank" rel="noopener noreferrer" aria-label="Discord" className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20">
                <img src="https://img.icons8.com/?size=100&id=87002&format=png&color=FFFFFF" alt="Discord" className="w-4 h-4" />
              </Link>
              <Link href="https://youtube.com/@peterep" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20">
                <Youtube className="w-4 h-4" />
              </Link>
              <Link href="mailto:admin@ownagent.tech" aria-label="Email" className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20">
                <Mail className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <Link
            href="https://ikako.vip/r/peter"
            target="_blank"
            rel="noopener noreferrer"
            className="block relative rounded-md bg-gradient-to-br from-white to-zinc-100 text-black border-2 border-white p-4 shadow hover:scale-105 hover:shadow-lg transition-all duration-300 hover:rotate-1 hover:border-red-500 hover:border-4"
          >
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] px-2 py-1 rounded-full">
              Limited Time
            </span>
            <div className="text-center">
              <h2 className="text-base font-bold uppercase tracking-wide">{t.kakobuy}</h2>
              <p className="text-xs text-zinc-700 mt-1">{t.kakobuySub}</p>
              <span className="mt-2 inline-block bg-black text-white text-xs font-medium px-3 py-1 rounded">{t.coupon}</span>
            </div>
          </Link>

          <Link href="/" className="relative block rounded-md bg-gradient-to-br from-[#F97084]/20 to-[#df1d48]/20 border-2 border-[#F97084]/50 p-4 text-center shadow hover:border-[#F97084] hover:scale-[1.02] hover:shadow-md transition-all duration-300">
            <span className="absolute -top-2 -right-2 bg-gradient-to-r from-[#F97084] to-[#df1d48] text-white text-[10px] px-2 py-1 rounded-full font-bold">
              ⭐ MAIN
            </span>
            <h2 className="text-base font-bold uppercase tracking-wide">{t.repFinds}</h2>
            <p className="text-xs text-white/90 mt-1 font-medium">{t.repFindsSub}</p>
          </Link>

          <Link href="https://discord.gg/certifiedwarrior" target="_blank" rel="noopener noreferrer" className="block rounded-md bg-[#0b0b0b] border border-[#5865F2]/30 p-3 text-center shadow hover:bg-[#5865F2]/10 hover:border-[#5865F2]/30 hover:scale-[1.02] hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-center gap-2 mb-2">
              <h2 className="text-sm font-semibold uppercase tracking-wide">{t.discord}</h2>
            </div>
            <p className="text-xs text-white/70 mt-1">{t.discordSub}</p>
          </Link>

          <Link href="https://docs.google.com/spreadsheets/d/1r6jOX3bMwGlxsKNYNrdjYea8aZ4zo3wjMl2KFEiOrCA/edit?gid=1258410961#gid=1258410961" target="_blank" rel="noopener noreferrer" className="relative block rounded-md bg-[#0b0b0b] border border-white/15 p-3 text-center hover:bg-white/5 hover:border-white/25 hover:scale-[1.02] transition-all duration-300">
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] px-2 py-1 rounded-full font-bold">
              🔥 HOT
            </span>
            <h2 className="text-sm font-semibold uppercase tracking-wide">KISSKEY SHOP SPREADSHEET</h2>
            <p className="text-xs text-white/70 mt-1">Kakobuy sheet w/ thousands of items</p>
          </Link>

          <Link href="https://3madman.x.yupoo.com/" target="_blank" rel="noopener noreferrer" className="block rounded-md bg-[#0b0b0b] border border-white/15 p-3 text-center shadow hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:scale-[1.02] hover:shadow-md transition-all duration-300">
            <h2 className="text-sm font-semibold uppercase tracking-wide">3MADMAN</h2>
            <p className="text-xs text-white/70 mt-1">Best streetwear seller</p>
          </Link>

          <Link href="https://phylliswatch.ru/?tracking=peter.rep" target="_blank" rel="noopener noreferrer" className="block rounded-md bg-[#0b0b0b] border border-white/15 p-3 text-center shadow hover:bg-red-500/10 hover:border-red-500/30 hover:scale-[1.02] hover:shadow-md transition-all duration-300">
            <h2 className="text-sm font-semibold uppercase tracking-wide">{t.phyllisWatch}</h2>
            <p className="text-xs text-white/70 mt-1">{t.phyllisWatchSub}</p>
            <span className="mt-2 inline-block bg-red-500 text-white text-[11px] font-medium px-2 py-1 rounded">{t.phyllisWatchBadge}</span>
          </Link>

          <Link href="https://chromewebstore.google.com/detail/repcentral-kakobuy-helper/immpfbghfbcgggghbfihoppnhkpbpjgm" target="_blank" rel="noopener noreferrer" className="relative block rounded-md bg-[#0b0b0b] border border-white/15 p-3 text-center hover:bg-blue-500/10 hover:border-blue-500/30 hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300">
            <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-[10px] px-2 py-1 rounded-full">
              Reborn Soon
            </span>
            <h2 className="text-sm font-semibold uppercase tracking-wide">{t.chromeExtension}</h2>
            <p className="text-xs text-white/70 mt-1">{t.chromeExtensionSub}</p>
          </Link>

          {/* BigY Store */}
          <Link
            href="https://docs.google.com/spreadsheets/d/1fEut13OoIh-MSXziZx4SrYY_MXVO0Z1mZ41EJPSZr9k/edit?usp=drivesdk"
            target="_blank"
            rel="noopener noreferrer"
            className="relative group block overflow-hidden rounded-md bg-[#0b0b0b] border border-white/15 p-3 shadow hover:bg-amber-500/5 hover:border-white/25 hover:scale-[1.02] hover:shadow-md transition-all duration-300"
          >
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-12 h-12 -rotate-12 z-0 opacity-20 group-hover:opacity-40 group-hover:rotate-3 transition-all duration-300" aria-hidden="true">
              <img
                src="https://db.rep-finds.com/storage/v1/object/public/upload/bigy.jpg"
                alt=""
                className="w-full h-full object-contain"
                style={{ WebkitMaskImage: 'radial-gradient(circle, rgba(0,0,0,1) 45%, rgba(0,0,0,0) 70%)', maskImage: 'radial-gradient(circle, rgba(0,0,0,1) 45%, rgba(0,0,0,0) 70%)' }}
              />
            </div>
            <div className="relative z-10 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <h2 className="text-sm font-semibold uppercase tracking-wide">BigY Store</h2>
              </div>
              <p className="text-xs text-white/70">electronics | clothing | shoes</p>
            </div>
          </Link>

          {/* BigY 20% Off Telegram */}
          <Link
            href="https://t.me/+050MKVqjF5gwOTZl"
            target="_blank"
            rel="noopener noreferrer"
            className="relative group block overflow-hidden rounded-md bg-[#0b0b0b] border border-white/15 p-3 shadow hover:bg-sky-500/5 hover:border-white/25 hover:scale-[1.02] hover:shadow-md transition-all duration-300"
          >
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-12 h-12 -rotate-12 z-0 opacity-20 group-hover:opacity-40 group-hover:rotate-3 transition-all duration-300" aria-hidden="true">
              <img
                src="https://db.rep-finds.com/storage/v1/object/public/upload/tele.png"
                alt=""
                className="w-full h-full object-contain"
                style={{ WebkitMaskImage: 'radial-gradient(circle, rgba(0,0,0,1) 45%, rgba(0,0,0,0) 70%)', maskImage: 'radial-gradient(circle, rgba(0,0,0,1) 45%, rgba(0,0,0,0) 70%)' }}
              />
            </div>
            <div className="relative z-10 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <h2 className="text-sm font-semibold uppercase tracking-wide">BigY 20% Off</h2>
              </div>
              <p className="text-xs text-white/70">You can ask the discount link</p>
            </div>
          </Link>

          <Link href="https://ownage.tech" target="_blank" rel="noopener noreferrer" className="block rounded-md bg-[#0b0b0b] border border-white/15 p-3 text-center hover:bg-purple-500/10 hover:border-purple-500/30 hover:scale-[1.02] hover:rotate-1 transition-all duration-300">
            <h2 className="text-sm font-semibold uppercase tracking-wide">{t.websiteDev}</h2>
            <p className="text-xs text-white/70 mt-1">{t.websiteDevSub}</p>
            <span className="mt-2 inline-block bg-white/10 text-white text-[11px] font-medium px-2 py-1 rounded">{t.websiteDevBadge}</span>
          </Link>
        </div>
      </main>
    </div>
  )
}
