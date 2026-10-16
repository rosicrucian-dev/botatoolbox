'use client'

import { type ReactNode } from 'react'

import { createPersistedStore, readStorage, writeStorage } from './persisted'

// The Timer feature (Utilities → Timer): a user-built meditation sequence
// of ordered "steps", persisted to localStorage. The builder page writes
// the steps; the full-screen player (/timer/play) reads them back on the
// route hop — localStorage is the cross-route channel, same as the
// Freeform spread. The store starts empty and fills in after mount
// (hydration: see ./persisted.ts); the player waits on `hydrated` before
// deciding "no steps, bounce back to the builder".

// A "normal" timer step: a plain countdown in whole minutes (>= 1).
export interface NormalStep {
  id: string
  kind: 'timer'
  minutes: number
}

// A "breath" step: a paced four-fold breath. Each segment is in seconds
// and any one may be 0 (e.g. all-in / all-out with no holds). `cycles` is
// how many times the whole in/hold/out/hold pattern repeats (>= 1).
export interface BreathStep {
  id: string
  kind: 'breath'
  inhale: number
  holdIn: number
  exhale: number
  holdOut: number
  cycles: number
}

export type TimerStep = NormalStep | BreathStep

const STORAGE_KEY = 'bota:timer-steps'

// Stable-ish unique id for React keys + persistence. crypto.randomUUID
// where available (all our browser floors have it in secure contexts);
// a counter fallback keeps dev/file:// from throwing.
let idCounter = 0
function newId(): string {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID()
    }
  } catch {
    // fall through
  }
  idCounter += 1
  return `step-${idCounter}`
}

// ---- Derived helpers (pure) -------------------------------------------

// The four segments of a breath, in order, with a human label and the
// scale the breath circle should be at when the segment *ends*.
export const BREATH_SEGMENTS = [
  { key: 'inhale', label: 'Breathe in' },
  { key: 'holdIn', label: 'Hold' },
  { key: 'exhale', label: 'Breathe out' },
  { key: 'holdOut', label: 'Hold' },
] as const

export function breathCycleSeconds(s: BreathStep): number {
  return (
    Math.max(0, s.inhale) +
    Math.max(0, s.holdIn) +
    Math.max(0, s.exhale) +
    Math.max(0, s.holdOut)
  )
}

// How long a whole step runs, in seconds. Minutes are clamped to >= 1 so
// a half-typed "0" never yields an instantly-skipping slide.
export function stepDurationSeconds(step: TimerStep): number {
  if (step.kind === 'timer') return Math.max(1, step.minutes) * 60
  return breathCycleSeconds(step) * Math.max(1, step.cycles)
}

// A breath step is only runnable if at least one segment has time in it —
// an all-zero pattern is nothing to breathe to.
export function breathHasMotion(s: BreathStep): boolean {
  return breathCycleSeconds(s) > 0
}

// Short "5:00" / "1:20" style duration for the builder cards.
export function formatDuration(seconds: number): string {
  const s = Math.round(seconds)
  const m = Math.floor(s / 60)
  const rem = s % 60
  return `${m}:${String(rem).padStart(2, '0')}`
}

// The nav label a step shows on the player's prev/next chips.
export function stepLabel(step: TimerStep, index: number): string {
  const n = index + 1
  if (step.kind === 'timer') {
    return `Step ${n} · ${step.minutes} min`
  }
  return `Step ${n} · Breathe ×${step.cycles}`
}

// ---- Presets ----------------------------------------------------------

// A preset is a titled, id-less step template. Applying it replaces the
// current steps with fresh copies (new ids). The description is a
// ReactNode (it can carry a link), so the preset *data* lives in a .tsx
// module (./app/(docs)/timer/presets); this file owns only the shape.
export type PresetStep = Omit<NormalStep, 'id'> | Omit<BreathStep, 'id'>

export interface TimerPreset {
  title: string
  description?: ReactNode
  steps: Array<PresetStep>
}

// ---- Persistence ------------------------------------------------------

function persist(steps: ReadonlyArray<TimerStep>): void {
  writeStorage(STORAGE_KEY, JSON.stringify(steps))
}

// Coerce an unknown parsed value into a clean step, or null if it's junk.
// Numbers are floored to non-negative integers; minutes/cycles floor to 1.
function toInt(v: unknown, min: number): number {
  const n = typeof v === 'number' ? v : Number(v)
  if (!Number.isFinite(n)) return min
  return Math.max(min, Math.floor(n))
}

function sanitizeStep(raw: unknown): TimerStep | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  const id = typeof r.id === 'string' ? r.id : newId()
  if (r.kind === 'timer') {
    return { id, kind: 'timer', minutes: toInt(r.minutes, 1) }
  }
  if (r.kind === 'breath') {
    return {
      id,
      kind: 'breath',
      inhale: toInt(r.inhale, 0),
      holdIn: toInt(r.holdIn, 0),
      exhale: toInt(r.exhale, 0),
      holdOut: toInt(r.holdOut, 0),
      cycles: toInt(r.cycles, 1),
    }
  }
  return null
}

// ---- Store ------------------------------------------------------------

interface TimerState {
  steps: Array<TimerStep>
  addTimer: () => void
  addBreath: () => void
  updateStep: (
    id: string,
    patch: Partial<Omit<NormalStep, 'id' | 'kind'>> &
      Partial<Omit<BreathStep, 'id' | 'kind'>>,
  ) => void
  removeStep: (id: string) => void
  moveStep: (id: string, dir: -1 | 1) => void
  clearSteps: () => void
  applyPreset: (preset: TimerPreset) => void
}

const { useStore, useHydrate } = createPersistedStore<TimerState>(
  (set, get) => ({
    steps: [],
    addTimer: () => {
      const next: Array<TimerStep> = [
        ...get().steps,
        { id: newId(), kind: 'timer', minutes: 5 },
      ]
      set({ steps: next })
      persist(next)
    },
    addBreath: () => {
      const next: Array<TimerStep> = [
        ...get().steps,
        {
          id: newId(),
          kind: 'breath',
          inhale: 4,
          holdIn: 4,
          exhale: 4,
          holdOut: 4,
          cycles: 10,
        },
      ]
      set({ steps: next })
      persist(next)
    },
    updateStep: (id, patch) => {
      const next = get().steps.map((s) =>
        s.id === id ? ({ ...s, ...patch } as TimerStep) : s,
      )
      set({ steps: next })
      persist(next)
    },
    removeStep: (id) => {
      const next = get().steps.filter((s) => s.id !== id)
      set({ steps: next })
      persist(next)
    },
    clearSteps: () => {
      set({ steps: [] })
      persist([])
    },
    moveStep: (id, dir) => {
      const steps = get().steps
      const i = steps.findIndex((s) => s.id === id)
      const j = i + dir
      if (i < 0 || j < 0 || j >= steps.length) return
      const next = [...steps]
      ;[next[i], next[j]] = [next[j], next[i]]
      set({ steps: next })
      persist(next)
    },
    applyPreset: (preset) => {
      const next: Array<TimerStep> = preset.steps.map((s) => ({
        ...s,
        id: newId(),
      }))
      set({ steps: next })
      persist(next)
    },
  }),
  // Junk entries are dropped by sanitizeStep; corrupt JSON throws and is
  // caught by the helper (steps stay empty, hydrated still flips).
  () => {
    const raw = readStorage(STORAGE_KEY)
    if (raw === null) return null
    const parsed: unknown = JSON.parse(raw)
    return {
      steps: Array.isArray(parsed)
        ? parsed.map(sanitizeStep).filter((s): s is TimerStep => s !== null)
        : [],
    }
  },
)

// The steps + mutators, triggering the one-time hydration on first mount.
export function useTimerSteps() {
  useHydrate()
  const steps = useStore((s) => s.steps)
  const hydrated = useStore((s) => s.hydrated)
  const addTimer = useStore((s) => s.addTimer)
  const addBreath = useStore((s) => s.addBreath)
  const updateStep = useStore((s) => s.updateStep)
  const removeStep = useStore((s) => s.removeStep)
  const moveStep = useStore((s) => s.moveStep)
  const clearSteps = useStore((s) => s.clearSteps)
  const applyPreset = useStore((s) => s.applyPreset)

  return {
    steps,
    hydrated,
    addTimer,
    addBreath,
    updateStep,
    removeStep,
    moveStep,
    clearSteps,
    applyPreset,
  }
}
