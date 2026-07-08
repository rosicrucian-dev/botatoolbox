'use client'

import {
  motion,
  useMotionTemplate,
  useMotionValue,
  type MotionValue,
} from 'framer-motion'
import { Link } from 'next-view-transitions'
import clsx from 'clsx'

import { GridPattern } from '@/components/GridPattern'
import { type NavLink } from '@/lib/nav'
import { useIsPinned, useTogglePin } from '@/lib/pinnedCards'

// The Protocol template's "Resources" cards (minus the circle icon): a grid
// of link cards with a mouse-following grid/gradient hover reveal. Extracted
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
      {links.map((link, index) => (
        <Card key={link.href} link={link} index={index} pinnable={pinnable} />
      ))}
    </div>
  )
}

// The four grid-pattern offsets Protocol ships, cycled by card index so
// each card's faint grid sits a little differently. Deterministic (index,
// not random) so server and client render identically.
type CardShape = Pick<
  React.ComponentPropsWithoutRef<typeof GridPattern>,
  'y' | 'squares'
>
const CARD_SHAPES: Array<CardShape> = [
  { y: 16, squares: [[0, 1], [1, 3]] },
  { y: -6, squares: [[-1, 2], [1, 3]] },
  { y: 32, squares: [[0, 2], [1, 4]] },
  { y: 22, squares: [[0, 1]] },
]

export function Card({
  link,
  index,
  pinnable = false,
}: {
  link: NavLink
  index: number
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
      <CardPattern
        {...CARD_SHAPES[index % CARD_SHAPES.length]}
        mouseX={mouseX}
        mouseY={mouseY}
      />
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
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10 12.75v4.5"
      />
    </svg>
  )
}

function CardPattern({
  mouseX,
  mouseY,
  ...shape
}: CardShape & {
  mouseX: MotionValue<number>
  mouseY: MotionValue<number>
}) {
  let maskImage = useMotionTemplate`radial-gradient(180px at ${mouseX}px ${mouseY}px, white, transparent)`
  let style = { maskImage, WebkitMaskImage: maskImage }

  return (
    <div className="pointer-events-none">
      <div className="absolute inset-0 rounded-2xl mask-[linear-gradient(white,transparent)] transition duration-300 group-hover:opacity-50">
        <GridPattern
          width={72}
          height={56}
          x="50%"
          className="absolute inset-x-0 inset-y-[-30%] h-[160%] w-full skew-y-[-18deg] fill-black/2 stroke-black/5 dark:fill-white/1 dark:stroke-white/2.5"
          {...shape}
        />
      </div>
      {/* The green wash, revealed under the cursor via the radial mask.
          Hardcoded hex to match the Protocol template's original tint. */}
      <motion.div
        className="absolute inset-0 rounded-2xl bg-linear-to-r from-[#D7EDEA] to-[#F4FBDF] opacity-0 transition duration-300 group-hover:opacity-100 dark:from-[#202D2E] dark:to-[#303428]"
        style={style}
      />
      <motion.div
        className="absolute inset-0 rounded-2xl opacity-0 mix-blend-overlay transition duration-300 group-hover:opacity-100"
        style={style}
      >
        <GridPattern
          width={72}
          height={56}
          x="50%"
          className="absolute inset-x-0 inset-y-[-30%] h-[160%] w-full skew-y-[-18deg] fill-black/50 stroke-black/70 dark:fill-white/2.5 dark:stroke-white/10"
          {...shape}
        />
      </motion.div>
    </div>
  )
}
