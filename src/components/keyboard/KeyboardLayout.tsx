import { ToolLayout } from '@/components/layout/ToolLayout'
import { toolFor } from '@/lib/tools'
import { type ReactNode } from 'react'

const tool = toolFor('/keyboard')

// Title row + tab links shared by /keyboard (the piano) and
// /keyboard/tableau — the Tools group's shape, from the Tools group's
// own data (src/lib/tools.ts) through the same ToolLayout the other
// tools use. A thin wrapper rather than a call at each page, because
// the keyboard's two pages are two different components.
export function KeyboardLayout({
  tab,
  children,
}: {
  tab: 'piano' | 'tableau'
  children: ReactNode
}) {
  return (
    <ToolLayout
      title={tool.title}
      tabs={tool.tabs}
      active={tab === 'tableau' ? '/keyboard/tableau' : '/keyboard'}
    >
      {children}
    </ToolLayout>
  )
}
