'use client'

import { ThemeProvider } from 'next-themes'

import { ScrollToTop } from '@/components/ScrollToTop'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" disableTransitionOnChange>
      <ScrollToTop />
      {children}
    </ThemeProvider>
  )
}
