import './globals.css'
import { Space_Grotesk, JetBrains_Mono } from 'next/font/google'

const display = Space_Grotesk({ subsets: ['latin'], variable: '--font-display' })
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata = {
  title: 'StockPilot · AI Inventory Console',
  description: 'An agentic, AI-styled stock management console built with Next.js, Tailwind CSS and MongoDB.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${mono.variable}`}>
      <body className="font-display bg-ink-950 text-slate-200 antialiased">
        {/* Ambient background: grid + glowing orbs */}
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-grid" />
          <div className="orb left-[-10%] top-[-10%] h-[38rem] w-[38rem] bg-violet-600/30" />
          <div className="orb right-[-15%] top-[20%] h-[34rem] w-[34rem] bg-cyan-500/20 [animation-delay:-6s]" />
          <div className="orb bottom-[-20%] left-[30%] h-[30rem] w-[30rem] bg-fuchsia-600/20 [animation-delay:-12s]" />
        </div>
        {children}
      </body>
    </html>
  )
}

