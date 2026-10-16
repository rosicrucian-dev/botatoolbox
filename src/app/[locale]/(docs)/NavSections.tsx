'use client'

import { CardGrid } from '@/components/nav/NavCards'
import { useUnlockedNav } from '@/components/nav/NavProvider'
import { PinnedSection } from '@/components/nav/PinnedSection'
import type { NavGroup } from '@/lib/nav'

// Home-page table of contents, styled as the Protocol template's
// "Resources" cards (minus the circle icon): each section is a heading, a
// hairline, then a grid of link cards with a mouse-following grid/gradient
// hover reveal (see CardGrid). Lives as a client component so it can drop
// members-only links while secret mode is locked (useUnlockedNav, which
// has also dropped `hidden` unlisted links).
export function NavSections() {
  const visible = useUnlockedNav()
  return (
    <>
      {/* Pinned grid first when the user has pins (renders nothing
          otherwise); it shares the article's space-y-14 rhythm with the
          groups below, so it appears and pushes them down on hydration. */}
      <PinnedSection />
      {visible.map((group) => (
        <Section key={group.title} group={group} />
      ))}
    </>
  )
}

function Section({ group }: { group: NavGroup }) {
  return (
    <section
      id={group.slug}
      // Clear the fixed Header (3.5rem + top safe-area inset) when the
      // home TOC scrolls to this section, plus a small breather.
      className="scroll-mt-[calc(5rem+env(safe-area-inset-top))]"
    >
      <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
        {group.title}
      </h2>
      <div className="mt-4 border-t border-zinc-900/5 pt-8 dark:border-white/5">
        <CardGrid links={group.links} pinnable />
      </div>
    </section>
  )
}
