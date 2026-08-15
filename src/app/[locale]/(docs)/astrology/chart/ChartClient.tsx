'use client'

import {
  ArrowUturnLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/16/solid'
import { useEffect, useMemo, useState, type ReactNode } from 'react'

import { AspectsTable } from '@/components/AspectsTable'
import { AstrologyTable } from '@/components/AstrologyTable'
import { AstrologyWheel } from '@/components/AstrologyWheel'
import { PageHeading } from '@/components/PageHeading'
import type { Planet, Sign } from '@/content/data'
import { computeAspects } from '@/lib/astro/aspects'
import { getEngine } from '@/lib/astro/engine'
import { DESKTOP_RINGS, MOBILE_RINGS } from '@/lib/astro/layout'
import type { Chart } from '@/lib/astro/types'

// Flat field styling for the date/time inputs, matching the StepButton border.
// Bespoke (not Catalyst's `Input`) so they have no shadow/depth and read
// consistently with the ‹/› buttons. `scheme-dark` themes the native picker.
// py-[5px] gives the same 36px height as the size-9 buttons (24px line + 10px
// padding + 2px border) while keeping the native date/time text vertically
// centred — a fixed h-9 top-aligns it instead.
const fieldClasses =
  'block rounded-lg border border-zinc-950/10 bg-transparent px-3 py-[5px] text-center text-sm/6 text-zinc-950 focus:outline-2 focus:-outline-offset-1 focus:outline-blue-500 dark:scheme-dark dark:border-white/15 dark:text-white'

// Square icon button matching the Catalyst `outline` look. Bespoke because
// Catalyst's Button uses asymmetric padding that can't be made square cleanly,
// and icon-buttons are sanctioned as bespoke in this app.
function StepButton({
  label,
  onClick,
  children,
  className = '',
}: {
  label: string
  onClick: () => void
  children: ReactNode
  className?: string
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`inline-flex size-9 cursor-default items-center justify-center rounded-lg border border-zinc-950/10 text-zinc-500 hover:bg-zinc-950/2.5 hover:text-zinc-700 focus:outline-2 focus:-outline-offset-1 focus:outline-blue-500 dark:border-white/15 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-zinc-200 ${className}`}
    >
      {children}
    </button>
  )
}

const pad = (n: number) => String(n).padStart(2, '0')

/** Local yyyy-mm-dd string for a date input's value. */
function toDateInputValue(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** Local hh:mm string for a time input's value. */
function toTimeInputValue(d: Date): string {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// planetBySlug/signBySlug come from the server page's
// getAstrology(locale) so the datasets stay out of the client bundle.
export function ChartClient({
  planetBySlug,
  signBySlug,
}: {
  planetBySlug: Record<string, Planet>
  signBySlug: Record<string, Sign>
}) {
  // `instant` is the moment the chart is drawn for — null until mounted, so the
  // server renders the empty wheel and there's no hydration mismatch. `pinned`
  // means the user chose a specific date; while pinned we stop tracking "now".
  const [instant, setInstant] = useState<Date | null>(null)
  const [pinned, setPinned] = useState(false)
  const [chart, setChart] = useState<Chart | null>(null)
  const aspects = useMemo(() => (chart ? computeAspects(chart) : []), [chart])

  // Track the live clock until the user pins a date; refresh every minute.
  // Hidden tabs skip the refresh and catch up the moment they're visible
  // again (visibilitychange fires on both hide and show; tick no-ops on
  // hide).
  useEffect(() => {
    if (pinned) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInstant(new Date())
    const tick = () => {
      if (!document.hidden) setInstant(new Date())
    }
    const id = setInterval(tick, 60_000)
    document.addEventListener('visibilitychange', tick)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', tick)
    }
  }, [pinned])

  // Recompute the chart whenever the instant changes.
  useEffect(() => {
    if (!instant) return
    let active = true
    getEngine()
      .computeChart(instant)
      .then((c) => {
        if (active) setChart(c)
      })
    return () => {
      active = false
    }
  }, [instant])

  function handleDateChange(value: string) {
    if (!value) return
    const [y, m, d] = value.split('-').map(Number)
    const next = new Date(instant ?? new Date())
    next.setFullYear(y, m - 1, d) // keep the chosen time-of-day
    setPinned(true)
    setInstant(next)
  }

  function handleTimeChange(value: string) {
    if (!value) return
    const [h, mi] = value.split(':').map(Number)
    const next = new Date(instant ?? new Date())
    next.setHours(h, mi, 0, 0) // keep the chosen date
    setPinned(true)
    setInstant(next)
  }

  // Step the chart one day backward (−1) or forward (+1), preserving the chosen
  // time-of-day so you can hold a time and scan across days.
  function stepDay(delta: number) {
    const next = new Date(instant ?? new Date())
    next.setDate(next.getDate() + delta)
    setPinned(true)
    setInstant(next)
  }

  // Reflect the pinned moment in the wheel's accessible name; a pinned
  // chart is not "current".
  const wheelLabel =
    pinned && instant
      ? `Planetary positions on the zodiac wheel for ${instant.toLocaleString()}`
      : 'Current planetary positions on the zodiac wheel'

  return (
    <article className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <PageHeading truncate>Chart</PageHeading>
        {/* Mobile: the title takes its own line and the stepper takes the
            full width below it — chevrons/Now stay fixed, the date/time
            fields flex to share the rest (and squish when Now appears).
            Desktop: title left, fixed-width stepper right. */}
        <div className="flex w-full items-center gap-2 sm:w-auto">
          {/* On mobile, Now sits between the time field and the › chevron
              (order-1, with the chevron bumped to order-2) so the ‹ and ›
              stay pinned to the screen edges. Desktop keeps DOM order. */}
          {pinned && (
            <StepButton
              label="Return to now"
              onClick={() => setPinned(false)}
              className="order-1 sm:order-none"
            >
              <ArrowUturnLeftIcon className="size-5" />
            </StepButton>
          )}
          <StepButton label="Previous day" onClick={() => stepDay(-1)}>
            <ChevronLeftIcon className="size-5" />
          </StepButton>
          <input
            type="date"
            aria-label="Chart date"
            // astronomy-engine stays accurate roughly within 1900–2100
            // (Pluto's tables and the analytic series degrade outside it);
            // bound the picker to the honest envelope.
            min="1900-01-01"
            max="2100-12-31"
            value={instant ? toDateInputValue(instant) : ''}
            onChange={(e) => handleDateChange(e.target.value)}
            className={`min-w-0 flex-1 sm:w-36 sm:flex-none ${fieldClasses}`}
          />
          <input
            type="time"
            aria-label="Chart time"
            value={instant ? toTimeInputValue(instant) : ''}
            onChange={(e) => handleTimeChange(e.target.value)}
            className={`min-w-0 flex-1 sm:w-28 sm:flex-none ${fieldClasses}`}
          />
          <StepButton
            label="Next day"
            onClick={() => stepDay(1)}
            className="order-2 sm:order-none"
          >
            <ChevronRightIcon className="size-5" />
          </StepButton>
        </div>
      </div>
      {/* Gray rounded frame (matching the Freeform table's inline board) so
          the circular wheel reads as sitting inside a contained square. The
          wheel is positioned `absolute` with a uniform inset rather than via
          padding + a percentage-height child: an aspect-ratio box doesn't give
          a child's `h-full` a definite height to resolve against, which
          letterboxed the SVG and made the vertical gap larger than the
          horizontal. Absolute insets are exactly equal on all four sides. */}
      <div className="relative aspect-square w-full rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/40">
        {/* Chunkier ring geometry on phones, roomier on desktop — same SVG,
            different profile, toggled by breakpoint (no JS, no flicker). */}
        <div className="absolute inset-4 sm:inset-6 sm:hidden">
          <AstrologyWheel
            chart={chart}
            aspects={aspects}
            profile={MOBILE_RINGS}
            label={wheelLabel}
            planetBySlug={planetBySlug}
            signBySlug={signBySlug}
          />
        </div>
        <div className="absolute inset-4 hidden sm:inset-6 sm:block">
          <AstrologyWheel
            chart={chart}
            aspects={aspects}
            profile={DESKTOP_RINGS}
            label={wheelLabel}
            planetBySlug={planetBySlug}
            signBySlug={signBySlug}
          />
        </div>
      </div>
      <AstrologyTable
        chart={chart}
        planetBySlug={planetBySlug}
        signBySlug={signBySlug}
      />
      {/* Gated on chart (not aspects) so the pre-hydration state stays
          blank but a computed chart with nothing in orb says so. */}
      {chart && <AspectsTable aspects={aspects} planetBySlug={planetBySlug} />}
    </article>
  )
}
