import { ToolLayout } from '@/components/layout/ToolLayout'
import { type ReactNode } from 'react'

// Title row + tab links shared by /keyboard, /keyboard/piano, and
// /keyboard/tableau — the same shape the Tools group's two tools use
// (src/lib/tools.ts), through the same component. Not in TOOLS itself
// because this one tool has two hrefs for one view: /keyboard and
// /keyboard/piano both render the piano.
export function KeyboardLayout({
  tab,
  children,
}: {
  tab: 'piano' | 'tableau'
  children: ReactNode
}) {
  return (
    <ToolLayout
      title="Keyboard"
      tabs={[
        { href: '/keyboard/tableau', label: 'Tableau' },
        { href: '/keyboard/piano', label: 'Piano' },
      ]}
      active={tab === 'tableau' ? '/keyboard/tableau' : '/keyboard/piano'}
    >
      {children}
    </ToolLayout>
  )
}
