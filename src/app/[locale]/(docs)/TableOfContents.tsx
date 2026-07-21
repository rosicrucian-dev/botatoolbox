'use client'

import { useVisibleNav } from '@/components/NavProvider'
import { useSecretMode } from '@/lib/useSecretMode'

// Home-page table of contents: a compact row of the section titles that
// scrolls to the matching <section id={group.slug}> in NavSections. Uses
// the same useVisibleNav() + secret-mode filter as NavSections so the
// list stays in lockstep with the rendered sections (and their ids).
// Only the group titles are listed — never the per-page cards inside
// them (e.g. Astrology, not chart/hora).
export function TableOfContents() {
  const { unlocked } = useSecretMode()
  const sections = useVisibleNav().filter(
    (group) => group.gated !== 'secret' || unlocked,
  )

  if (sections.length < 2) return null

  return (
    <nav aria-label="Sections" className="flex flex-wrap gap-x-3 gap-y-2">
      {sections.map((group) => (
        <a
          key={group.slug}
          href={`#${group.slug}`}
          onClick={(event) => {
            // Smooth in-page scroll (native anchor jump is the no-JS
            // fallback). scroll-mt on the target clears the fixed header.
            const target = document.getElementById(group.slug)
            if (!target) return
            event.preventDefault()
            target.scrollIntoView({ behavior: 'smooth' })
            history.replaceState(null, '', `#${group.slug}`)
          }}
          className="rounded-full bg-zinc-900/5 px-3 py-1 text-sm font-medium text-zinc-600 transition hover:bg-zinc-900/10 hover:text-zinc-900 dark:bg-white/5 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-white"
        >
          {group.title}
        </a>
      ))}
    </nav>
  )
}
