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
  'block rounded-lg border border-zinc-950/10 bg-transparent px-3 py-[5px] text-sm/6 text-zinc-950 focus:outline-2 focus:-outline-offset-1 focus:outline-blue-500 dark:scheme-dark dark:border-white/15 dark:text-white'

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

export function AstrologyChartClient() {
  // `instant` is the moment the chart is drawn for — null until mounted, so the
  // server renders the empty wheel and there's no hydration mismatch. `pinned`
  // means the user chose a specific date; while pinned we stop tracking "now".
  const [instant, setInstant] = useState<Date | null>(null)
  const [pinned, setPinned] = useState(false)
  const [chart, setChart] = useState<Chart | null>(null)
  const aspects = useMemo(() => (chart ? computeAspects(chart) : []), [chart])

  // Track the live clock until the user pins a date; refresh every minute.
  useEffect(() => {
    if (pinned) return
    setInstant(new Date())
    const id = setInterval(() => setInstant(new Date()), 60_000)
    return () => clearInterval(id)
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

  return (
    <article className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="hidden text-3xl font-semibold tracking-tight sm:block dark:text-white">
          Chart
        </h1>
        {/* Mobile: fill the row — chevrons/Now stay fixed, the date/time
            fields flex to share the rest (and squish when Now appears).
            Desktop: fixed widths, right-aligned. */}
        <div className="ml-auto flex w-full items-center gap-2 sm:w-auto">
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
      <div className="mx-auto aspect-square w-full max-w-[min(100%,calc(100svh-12rem))]">
        {/* Chunkier ring geometry on phones, roomier on desktop — same SVG,
            different profile, toggled by breakpoint (no JS, no flicker). */}
        <div className="h-full w-full sm:hidden">
          <AstrologyWheel chart={chart} aspects={aspects} profile={MOBILE_RINGS} />
        </div>
        <div className="hidden h-full w-full sm:block">
          <AstrologyWheel
            chart={chart}
            aspects={aspects}
            profile={DESKTOP_RINGS}
          />
        </div>
      </div>
      <AstrologyTable chart={chart} />
      <AspectsTable aspects={aspects} />
    </article>
  )
}
