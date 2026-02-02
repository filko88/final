import type { CSSProperties } from "react"
import { SiteConfig } from "@/config/site"

const clamp = (value: number, min = 0, max = 1) => Math.min(Math.max(value, min), max)

export const hexToHsl = (hexColor: string) => {
  const hex = hexColor.replace("#", "")
  const bigint = parseInt(hex, 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255

  const rNorm = r / 255
  const gNorm = g / 255
  const bNorm = b / 255

  const max = Math.max(rNorm, gNorm, bNorm)
  const min = Math.min(rNorm, gNorm, bNorm)
  const delta = max - min

  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (delta !== 0) {
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min)
    switch (max) {
      case rNorm:
        h = (gNorm - bNorm) / delta + (gNorm < bNorm ? 6 : 0)
        break
      case gNorm:
        h = (bNorm - rNorm) / delta + 2
        break
      default:
        h = (rNorm - gNorm) / delta + 4
        break
    }
    h /= 6
  }

  const hDegrees = Math.round(h * 360)
  const sPercent = Math.round(clamp(s) * 100)
  const lPercent = Math.round(clamp(l) * 100)

  return `${hDegrees} ${sPercent}% ${lPercent}%`
}

export const buildThemeCSSVariables = (config: SiteConfig): CSSProperties => {
  return {
    "--accent": hexToHsl(config.theme.accent),
    "--radius": `${config.theme.radius}px`,
    "--card-blur": config.theme.cardBlur,
    "--card-opacity": config.theme.cardOpacity.toString(),
  } as CSSProperties
}

