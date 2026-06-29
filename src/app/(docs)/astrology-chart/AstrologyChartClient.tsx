'use client'

import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/16/solid'
import { useEffect, useMemo, useState, type ReactNode } from 'react'

import { AspectsTable } from '@/components/AspectsTable'
import { AstrologyTable } from '@/components/AstrologyTable'
import { AstrologyWheel } from '@/components/AstrologyWheel'
import { Button } from '@/components/catalyst/button'
import { Input } from '@/components/catalyst/input'
import { computeAspects } from '@/lib/astro/aspects'
import { getEngine } from '@/lib/astro/engine'
import type { Chart } from '@/lib/astro/types'

// Square icon button matching the Catalyst `outline` look. Bespoke because
// Catalyst's Button uses asymmetric padding that can't be made square cleanly,
// and icon-buttons are sanctioned as bespoke in this app.
function StepButton({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="inline-flex size-9 cursor-default items-center justify-center rounded-lg border border-zinc-950/10 text-zinc-500 hover:bg-zinc-950/2.5 hover:text-zinc-700 focus:outline-2 focus:-outline-offset-1 focus:outline-blue-500 dark:border-white/15 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-zinc-200"
    >
      {children}
    </button>
  )
}

/** Local yyyy-mm-dd string for a date input's value. */
function toDateInputValue(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
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
    // Keep the current time-of-day so the fast-moving Moon stays reasonable.
    const next = new Date(instant ?? new Date())
    next.setFullYear(y, m - 1, d)
    setPinned(true)
    setInstant(next)
  }

  // Step the chart one day backward (−1) or forward (+1), keeping time-of-day.
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
          Astrology Chart
        </h1>
        <div className="ml-auto flex items-center gap-2">
          {pinned && (
            <Button outline onClick={() => setPinned(false)}>
              Now
            </Button>
          )}
          <StepButton label="Previous day" onClick={() => stepDay(-1)}>
            <ChevronLeftIcon className="size-5" />
          </StepButton>
          <div className="w-44">
            <Input
              type="date"
              aria-label="Chart date"
              value={instant ? toDateInputValue(instant) : ''}
              onChange={(e) => handleDateChange(e.target.value)}
            />
          </div>
          <StepButton label="Next day" onClick={() => stepDay(1)}>
            <ChevronRightIcon className="size-5" />
          </StepButton>
        </div>

      </div>
      <div className="mx-auto aspect-square w-full max-w-[min(100%,calc(100svh-12rem))]">
        <AstrologyWheel chart={chart} aspects={aspects} />
      </div>
      <AstrologyTable chart={chart} />
      <AspectsTable aspects={aspects} />
    </article>
  )
}
