'use client'

import { CardGrid } from '@/components/NavCards'
import { PinnedSection } from '@/components/PinnedSection'
import { useVisibleNav } from '@/components/NavProvider'
import type { NavGroup } from '@/lib/nav'
import { useSecretMode } from '@/lib/useSecretMode'

// Home-page table of contents, styled as the Protocol template's
// "Resources" cards (minus the circle icon): each section is a heading, a
// hairline, then a grid of link cards with a mouse-following grid/gradient
// hover reveal (see CardGrid). Lives as a client component so it can filter
// out secret-mode-gated groups (e.g. Meditations) via useSecretMode.
// visibleNavigation has already dropped `hidden` (unlisted) links.
export function NavSections() {
  const { unlocked } = useSecretMode()
  const visible = useVisibleNav().filter(
    (group) => group.gated !== 'secret' || unlocked,
  )
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
    <section>
      <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
        {group.title}
      </h2>
      <div className="mt-4 border-t border-zinc-900/5 pt-8 dark:border-white/5">
        <CardGrid links={group.links} pinnable />
      </div>
    </section>
  )
}
