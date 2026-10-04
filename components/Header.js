import React from "react";

const links = [
    { href: "#overview", label: "Overview" },
    { href: "#search", label: "Search" },
    { href: "#add", label: "Add" },
    { href: "#stock", label: "Stock" },
]

const Header = ({ dbOnline = true }) => {
    return (
        <header className="sticky top-0 z-40 border-b border-white/5 bg-ink-950/60 backdrop-blur-xl">
            <div className="mx-auto flex max-w-7xl items-center gap-6 px-5 py-3.5">
                <a href="#overview" className="group flex items-center gap-3">
                    <span className="relative grid h-10 w-10 place-items-center rounded-xl bg-brand shadow-glow">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-5 w-5 text-white" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                        </svg>
                        <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-ink-950 bg-emerald-400" />
                    </span>
                    <span className="leading-tight">
                        <span className="block text-lg font-bold tracking-tight text-white">
                            Stock<span className="text-gradient">Pilot</span>
                        </span>
                        <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">
                            Inventory Console
                        </span>
                    </span>
                </a>

                <nav aria-label="Primary" className="ml-auto hidden items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1 md:flex">
                    {links.map((l) => (
                        <a
                            key={l.href}
                            href={l.href}
                            className="rounded-full px-4 py-1.5 text-sm text-slate-400 transition hover:bg-white/10 hover:text-white"
                        >
                            {l.label}
                        </a>
                    ))}
                </nav>

                <div className="ml-auto flex items-center gap-3 md:ml-0">
                    <span className={`chip ${dbOnline ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300" : "border-amber-400/30 bg-amber-400/10 text-amber-300"}`}>
                        <span className="relative flex h-2 w-2">
                            <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${dbOnline ? "bg-emerald-400" : "bg-amber-400"}`} />
                            <span className={`relative inline-flex h-2 w-2 rounded-full ${dbOnline ? "bg-emerald-400" : "bg-amber-400"}`} />
                        </span>
                        {dbOnline ? "db connected" : "offline mode"}
                    </span>
                    <kbd className="hidden rounded-md border border-white/10 bg-white/5 px-2 py-1 font-mono text-[11px] text-slate-400 sm:inline-block">
                        Ctrl K
                    </kbd>
                </div>
            </div>
        </header>
    )
}

export default Header
