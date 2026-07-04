'use client'

import { motion } from 'framer-motion'
import { Link } from 'next-view-transitions'

import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { Logo } from '@/components/Logo'
import { Navigation } from '@/components/Navigation'

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full lg:ml-72 xl:ml-80">
      <motion.header
        layoutScroll
        className="contents lg:pointer-events-none lg:fixed lg:inset-0 lg:z-40 lg:flex"
      >
        <div className="contents lg:pointer-events-auto lg:block lg:w-72 lg:overflow-y-auto lg:border-r lg:border-zinc-900/10 lg:px-6 lg:pt-4 lg:pb-8 xl:w-80 lg:dark:border-white/10">
          <div className="hidden lg:flex">
            <Link href="/" aria-label="Home">
              <Logo className="h-6" />
            </Link>
          </div>
          <Header />
          <Navigation className="hidden lg:mt-10 lg:block" />
        </div>
      </motion.header>
      <div
        className="relative flex h-full flex-col px-4 sm:px-6 lg:px-8"
        // Clear the fixed header, which is taller in a standalone PWA by the
        // top safe-area inset (0 in a normal browser). Matches Header.tsx.
        style={{ paddingTop: 'calc(3.5rem + env(safe-area-inset-top))' }}
      >
        <main className="mx-auto w-full max-w-2xl flex-auto pt-6 pb-10 lg:mx-[calc(50%-min(50%,var(--container-lg)))] lg:max-w-3xl">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  )
}
