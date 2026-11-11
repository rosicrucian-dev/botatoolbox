'use client'

import { CardGrid } from '@/components/nav/NavCards'
import { useUnlockedNav } from '@/components/nav/NavProvider'
import { PinnedSection } from '@/components/nav/PinnedSection'
import type { NavGroup } from '@/lib/nav'

// Home-page table of contents, styled as the Protocol template's
// "Resources" cards (minus the circle icon): each section is a heading, a
// hairline, then a grid of link cards with a mouse-following gradient
// hover reveal (see CardGrid). Lives as a client component so it can drop
// members-only links while secret mode is locked (useUnlockedNav, which
// has also dropped `hidden` unlisted links).
//
// TITLE ONLY (10 November 2026). Home draws every group, which is every
// link on the site — twenty-odd cards, and with a description on each
// the page was a wall of sentences a reader scrolled rather than an
// index they scanned. The descriptions still stand on the group pages
// (/reference, /tools, …), where there are a handful of cards and the
// line earns its room. It is also what the PINNED grid above has always
// done, so the two blocks on this page no longer draw two kinds of
// card.
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
        <CardGrid
          links={group.links.map(({ href, title }) => ({ href, title }))}
          pinnable
        />
      </div>
    </section>
  )
}
