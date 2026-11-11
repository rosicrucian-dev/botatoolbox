'use client'

import { Link } from '@/components/locale/LocaleLink'
import clsx from 'clsx'
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  type MotionValue,
} from 'framer-motion'

import { type NavLink } from '@/lib/nav'
import { useIsPinned, useTogglePin } from '@/lib/stores/pinnedCards'

// The Protocol template's "Resources" cards (minus the circle icon): a grid
// of link cards with a mouse-following gradient hover reveal. Extracted
// here so both the home-page TOC (NavSections) and the per-group landing
// pages (GroupPage) render an identical card grid. Client component so the
// hover effect's pointer tracking works.

// A grid of link cards, two columns from `sm` up. `hidden` links should
// already be filtered out by the caller (visibleNavigation). When
// `pinnable` is set, each card gets a pin toggle in its corner (homepage
// only — see PinnedSection / NavSections).
export function CardGrid({
  links,
  pinnable = false,
}: {
  links: Array<NavLink>
  pinnable?: boolean
}) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {links.map((link) => (
        <Card key={link.href} link={link} pinnable={pinnable} />
      ))}
    </div>
  )
}

// NO GRID (10 November 2026, an experiment). Protocol draws a skewed
// GridPattern on each card twice over — faint at rest, brighter under
// the cursor through the radial mask — with four offsets cycled by card
// index so no two cards ruled alike. On a page of cards it read as
// ruled paper showing through, and the diagonals cut across the type.
//
// The hover reveal stays, because what it is FOR is saying which card
// the cursor is on: the green wash still follows the pointer. Only the
// ruling is gone, from the cards and from the homepage hero alike, so
// GridPattern is drawn nowhere now and is deleted with this.
export function Card({
  link,
  pinnable = false,
}: {
  link: NavLink
  pinnable?: boolean
}) {
  let mouseX = useMotionValue(0)
  let mouseY = useMotionValue(0)

  function onMouseMove({
    currentTarget,
    clientX,
    clientY,
  }: React.MouseEvent<HTMLDivElement>) {
    let { left, top } = currentTarget.getBoundingClientRect()
    mouseX.set(clientX - left)
    mouseY.set(clientY - top)
  }

  return (
    <div
      onMouseMove={onMouseMove}
      className="group relative flex rounded-2xl bg-zinc-50 transition-shadow hover:shadow-md hover:shadow-zinc-900/5 dark:bg-white/2.5 dark:hover:shadow-black/5"
    >
      <CardPattern mouseX={mouseX} mouseY={mouseY} />
      <div className="absolute inset-0 rounded-2xl ring-1 ring-zinc-900/7.5 ring-inset group-hover:ring-zinc-900/10 dark:ring-white/10 dark:group-hover:ring-white/20" />
      {/* w-full so this (the positioning context for the hit target
          below) fills the card even when there's no description — without
          it a flex item shrinks to the title's width and only that strip
          is clickable. */}
      <div className="relative w-full rounded-2xl px-4 py-4">
        <h3
          className={clsx(
            'text-sm/7 font-semibold text-zinc-900 dark:text-white',
            // Leave room for the pin button in the corner.
            pinnable && 'pr-7',
          )}
        >
          <Link href={link.href}>
            {/* Full-card hit target — stretches the link over the whole
                card so the padding, pattern, and ring are all clickable. */}
            <span className="absolute inset-0 rounded-2xl" />
            {link.title}
          </Link>
        </h3>
        {link.description && (
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {link.description}
          </p>
        )}
      </div>
      {pinnable && <PinButton href={link.href} title={link.title} />}
    </div>
  )
}

// The pin toggle in a card's top-right. Sits above the full-card link
// overlay (z-10) and stops propagation, so a click pins/unpins without
// navigating. Reads its own pinned state via a per-href selector, so it
// re-renders only when this card flips.
function PinButton({ href, title }: { href: string; title: string }) {
  const pinned = useIsPinned(href)
  const togglePin = useTogglePin()

  return (
    <button
      type="button"
      aria-label={pinned ? `Unpin ${title}` : `Pin ${title}`}
      aria-pressed={pinned}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        togglePin(href)
      }}
      className={clsx(
        'absolute top-2 right-2 z-10 flex h-6 w-6 items-center justify-center rounded-md transition',
        // Same glyph throughout — only color/visibility change. Emerald
        // means pinned, and pinned only; an unpinned pin stays muted zinc
        // even on hover (it darkens slightly for feedback, never emerald).
        //
        // Visibility depends on whether the device can hover. On touch
        // (no hover) the muted pin stays visible so it reads as a tappable
        // control — there's no hover to reveal it otherwise. On hover-
        // capable devices it's hidden until the card is hovered (or the
        // button is focused), keeping the resting card clean.
        pinned
          ? 'text-emerald-600 dark:text-emerald-400'
          : 'text-zinc-400 opacity-100 hover:text-zinc-600 focus-visible:opacity-100 dark:text-zinc-500 dark:hover:text-zinc-300 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100',
      )}
    >
      <PinIcon />
    </button>
  )
}

// A thumbtack outline — identical shape/weight whether pinned or merely
// hovered, so the icon never appears to shrink between states. Pinned vs.
// unpinned is conveyed by color and visibility (see PinButton), not by
// swapping the glyph.
function PinIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.25 2.75h1.5l-.4 5.05 2.4 1.9v1.55H7.25V9.7l2.4-1.9-.4-5.05Z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 12.75v4.5" />
    </svg>
  )
}

// The green wash, revealed under the cursor by a radial mask that
// follows the pointer. Hardcoded hex to match the Protocol template's
// original tint, as the hero's wash is.
function CardPattern({
  mouseX,
  mouseY,
}: {
  mouseX: MotionValue<number>
  mouseY: MotionValue<number>
}) {
  let maskImage = useMotionTemplate`radial-gradient(180px at ${mouseX}px ${mouseY}px, white, transparent)`
  let style = { maskImage, WebkitMaskImage: maskImage }

  return (
    <div className="pointer-events-none">
      <motion.div
        className="absolute inset-0 rounded-2xl bg-linear-to-r from-[#D7EDEA] to-[#F4FBDF] opacity-0 transition duration-300 group-hover:opacity-100 dark:from-[#202D2E] dark:to-[#303428]"
        style={style}
      />
    </div>
  )
}
