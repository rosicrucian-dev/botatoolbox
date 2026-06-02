'use client'

import {
  Children,
  Fragment,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

import { HeaderChip } from '@/components/HeaderChip'
import { cardBySlug, cards, cardImage } from '@/content/data/tarot'
import { minorBySlug, minorCards, minorImage } from '@/content/data'

type Direction = 'left' | 'right'
const DIRECTION_KEY = 'random-pull:direction'
const INCLUDE_MINOR_KEY = 'random-pull:include-minor'

// SSR-safe persisted string state (Left/Right preference).
function usePersistedDirection(): [Direction, (d: Direction) => void] {
  const [direction, setDirection] = useState<Direction>('right')
  useEffect(() => {
    try {
      const stored = localStorage.getItem(DIRECTION_KEY)
      if (stored === 'left' || stored === 'right') setDirection(stored)
    } catch {}
  }, [])
  const setPersisted = useCallback((next: Direction) => {
    setDirection(next)
    try {
      localStorage.setItem(DIRECTION_KEY, next)
    } catch {}
  }, [])
  return [direction, setPersisted]
}

// SSR-safe persisted boolean (Minor toggle, etc.).
function usePersistedToggle(
  key: string,
  defaultValue: boolean,
): [boolean, (v: boolean) => void] {
  const [value, setValue] = useState(defaultValue)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(key)
      if (stored !== null) setValue(stored === '1')
    } catch {}
  }, [key])
  const setPersisted = useCallback(
    (v: boolean) => {
      setValue(v)
      try {
        localStorage.setItem(key, v ? '1' : '0')
      } catch {}
    },
    [key],
  )
  return [value, setPersisted]
}

// Resolve a slug to either a major or minor card. Major slugs never
// match the `<num>-<suit>` form of minor slugs, so a slug uniquely
// identifies one deck.
type ResolvedCard =
  | { kind: 'major'; card: (typeof cards)[number] }
  | { kind: 'minor'; card: (typeof minorCards)[number] }

function resolveSlug(slug: string): ResolvedCard | null {
  const major = cardBySlug[slug]
  if (major) return { kind: 'major', card: major }
  const minor = minorBySlug[slug]
  if (minor) return { kind: 'minor', card: minor }
  return null
}

export function RandomPullClient() {
  const router = useRouter()
  const sp = useSearchParams()
  const [direction, setDirection] = usePersistedDirection()
  const [includeMinor, setIncludeMinor] = usePersistedToggle(
    INCLUDE_MINOR_KEY,
    false,
  )

  // Initial pulled state from ?pulled=slug1,slug2 so the back button
  // from a card detail page restores the previous pull state.
  const initialPulled = sp.get('pulled') ?? ''
  const [pulled, setPulled] = useState<Array<string>>(() =>
    initialPulled ? initialPulled.split(',').filter(Boolean) : [],
  )

  // Mirror state → URL via router.replace (no history entry per pull).
  useEffect(() => {
    const next = pulled.join(',')
    const current = sp.get('pulled') ?? ''
    if (next === current) return
    const params = new URLSearchParams(sp.toString())
    if (next) params.set('pulled', next)
    else params.delete('pulled')
    const qs = params.toString()
    router.replace(qs ? `?${qs}` : '?', { scroll: false })
  }, [pulled, router, sp])

  // Combined deck. When Minor is on, every pull is from a single 62-card
  // pool — so a major has a 22/62 chance and a minor has a 40/62 chance,
  // matching what shuffling them together would give.
  const pulledSet = new Set(pulled)
  const deck: Array<string> = includeMinor
    ? [...cards.map((c) => c.slug), ...minorCards.map((c) => c.slug)]
    : cards.map((c) => c.slug)
  const remaining = deck.filter((s) => !pulledSet.has(s))
  const exhausted = remaining.length === 0

  function pull() {
    if (remaining.length === 0) return
    const slug = remaining[Math.floor(Math.random() * remaining.length)]
    setPulled((prev) =>
      direction === 'left' ? [slug, ...prev] : [...prev, slug],
    )
  }

  function clear() {
    setPulled([])
  }

  return (
    <article className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold tracking-tight dark:text-white">
          <span className="md:hidden">Pull</span>
          <span className="hidden md:inline">Random Pull</span>
        </h1>
        <div className="flex flex-wrap items-center gap-3 text-zinc-900 dark:text-white">
          <Tabs>
            <Tab
              active={direction === 'left'}
              onClick={() => setDirection('left')}
            >
              Left
            </Tab>
            <Tab
              active={direction === 'right'}
              onClick={() => setDirection('right')}
            >
              Right
            </Tab>
          </Tabs>
          <HeaderChip
            pressed={includeMinor}
            onClick={() => setIncludeMinor(!includeMinor)}
          >
            Minor
          </HeaderChip>
          <button
            type="button"
            onClick={pull}
            disabled={exhausted}
            className="inline-flex h-9 shrink-0 items-center justify-center rounded-md bg-emerald-500 px-3 text-sm font-medium whitespace-nowrap text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-emerald-500"
          >
            Pull
          </button>
        </div>
      </div>

      {pulled.length === 0 ? (
        <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
          Use the Pull button above to add a card.
        </p>
      ) : (
        <>
          {/* 30% × 3 cards + 5% × 2 gaps = 100% of article width. */}
          <div className="flex flex-wrap justify-center gap-x-[5%] gap-y-2 md:gap-y-4">
            {pulled.map((slug, i) => {
              const found = resolveSlug(slug)
              if (!found) return null
              return found.kind === 'major' ? (
                <Link
                  key={i}
                  href={`/tarot/${found.card.slug}`}
                  className="block w-[30%] transition hover:opacity-80"
                >
                  <img
                    src={cardImage(found.card)}
                    alt={found.card.name}
                    width={724}
                    height={1200}
                    loading="lazy"
                    className="h-auto w-full rounded-md shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-700"
                  />
                </Link>
              ) : (
                <Link
                  key={i}
                  href={`/tarot/minor-arcana/${found.card.slug}`}
                  className="block w-[30%] transition hover:opacity-80"
                >
                  <img
                    src={minorImage(found.card)}
                    alt={`${found.card.num} of ${found.card.suit}`}
                    loading="lazy"
                    // CSS aspect-ratio forces the box to the major
                    // proportion. `object-fill` stretches the minor
                    // pixels to fill it — content is preserved
                    // (nothing cropped) at the cost of ~4% vertical
                    // compression.
                    className="aspect-[724/1200] w-full rounded-md object-fill ring-1 ring-zinc-200 dark:ring-zinc-700"
                  />
                </Link>
              )
            })}
          </div>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={clear}
              className="rounded-md bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 ring-1 ring-zinc-900/5 transition hover:bg-zinc-200 active:bg-zinc-300 md:text-base dark:bg-zinc-800 dark:text-white dark:ring-white/10 dark:hover:bg-zinc-700 dark:active:bg-zinc-600"
            >
              Clear
            </button>
          </div>
        </>
      )}
    </article>
  )
}

// Segmented-control container — same visual treatment as
// KeyboardLayout's Tabs.
function Tabs({ children }: { children: ReactNode }) {
  const tabs = Children.toArray(children)
  return (
    <div className="inline-flex h-9 overflow-hidden rounded-md ring-1 ring-current/20">
      {tabs.map((tab, i) => (
        <Fragment key={i}>
          {i > 0 && <span aria-hidden="true" className="w-px bg-current/20" />}
          {tab}
        </Fragment>
      ))}
    </div>
  )
}

function Tab({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        'inline-flex h-full items-center justify-center px-3 text-sm font-medium whitespace-nowrap transition ' +
        (active ? 'bg-current/15' : 'hover:bg-current/10')
      }
    >
      {children}
    </button>
  )
}
