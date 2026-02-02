"use client"


export default function DiscordFab() {
    return (
        <a
            href="https://discord.gg/certifiedwarrior"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Join our Discord"
            className="discord-fab fixed bottom-4 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-foreground/10 bg-foreground text-background shadow-lg shadow-foreground/20 transition hover:bg-foreground/90"
        >
            <img
                src="https://img.icons8.com/?size=100&id=87002&format=png&color=FFFFFF"
                alt=""
                className="h-5 w-5"
                loading="lazy"
            />
        </a>
    )
}
