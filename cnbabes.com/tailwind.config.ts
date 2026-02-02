/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        "brand-pink": "#f7a6d0",
        "brand-red": "#f58bbf",
        "brand-orange": "#f7b9da",
        "dark-bg": "#ffffff",
        "dark-bg-alpha-40": "rgba(255, 255, 255, 0.4)",
        "dark-bg-alpha-96": "rgba(255, 255, 255, 0.96)",
        "white-alpha-6": "rgba(58, 15, 31, 0.06)",
        "white-alpha-10": "rgba(58, 15, 31, 0.1)",
        "white-alpha-20": "rgba(58, 15, 31, 0.2)",
        "white-alpha-55": "rgba(58, 15, 31, 0.55)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "star-movement-bottom": {
          "0%": { transform: "translate(0%, 0%)", opacity: "1" },
          "100%": { transform: "translate(-100%, 0%)", opacity: "1" },
        },
        "star-movement-top": {
          "0%": { transform: "translate(0%, 0%)", opacity: "1" },
          "100%": { transform: "translate(100%, 0%)", opacity: "1" },
        },
      }, animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "star-movement-bottom": "star-movement-bottom linear infinite",
        "star-movement-top": "star-movement-top linear infinite",
      },
      backgroundImage: {
        "radial-pink-hero": "radial-gradient(90% 90% at 50% 0%, rgba(247, 166, 208, 0.65) 0%, rgba(255, 239, 248, 0) 70%)",
        "radial-glow": "radial-gradient(19.55% 107.12% at 50% 0%, rgba(247, 166, 208, 0.65) 0%, rgba(247, 166, 208, 0.08) 100%)",
        "linear-stroke": "linear-gradient(78.31deg, rgba(247, 166, 208, 0.18) 37.2%, rgba(245, 139, 191, 0.45) 98.28%)",
        "linear-fill-dark": "linear-gradient(180deg, rgba(255, 239, 248, 0) 0%, rgba(247, 166, 208, 0.3) 100%)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
