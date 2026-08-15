'use client'

import {
  ChevronDownIcon,
  ChevronUpIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/16/solid'

import { SetBreadcrumbs } from '@/components/Breadcrumbs'
import { Button } from '@/components/catalyst/button'
import { Field, Label } from '@/components/catalyst/fieldset'
import { Input } from '@/components/catalyst/input'
import { PageToolbar } from '@/components/PageToolbar'
import { toolbarButtonSize } from '@/components/toolbarButton'
import { ensureAudioContext } from '@/lib/audioContext'
import { enterPlayerFullscreen } from '@/lib/playerFullscreen'
import {
  breathHasMotion,
  formatDuration,
  stepDurationSeconds,
  useTimerSteps,
  type BreathStep,
  type NormalStep,
  type TimerStep,
} from '@/lib/timer'

import { TIMER_PRESETS } from './presets'

// Presets are fully built (data in ./presets, applyPreset in the store,
// UI below) but intentionally hidden from users for now — flip this to
// true to re-enable. Kept wired up so we don't lose the work on a revisit.
const SHOW_PRESETS = true

// A compact labelled number field — the app has no numeric-input pattern
// yet, so this establishes one on top of the Catalyst Input.
function NumberField({
  label,
  value,
  min,
  onChange,
}: {
  label: string
  value: number
  min: number
  onChange: (n: number) => void
}) {
  return (
    <Field>
      <Label className="block text-center">{label}</Label>
      <Input
        type="number"
        inputMode="numeric"
        min={min}
        value={String(value)}
        onChange={(e) => {
          const n = Number(e.target.value)
          if (Number.isFinite(n)) onChange(Math.max(min, Math.floor(n)))
          else onChange(min)
        }}
      />
    </Field>
  )
}

// The zinc surface + inset-ring card used across the app.
const cardClass =
  'relative rounded-2xl bg-zinc-50 p-5 ring-1 ring-zinc-900/7.5 ring-inset dark:bg-white/2.5 dark:ring-white/10'

function StepControls({
  index,
  count,
  onMove,
  onRemove,
}: {
  index: number
  count: number
  onMove: (dir: -1 | 1) => void
  onRemove: () => void
}) {
  const iconBtn =
    'flex size-8 items-center justify-center rounded-lg text-zinc-500 ring-1 ring-zinc-900/10 ring-inset transition hover:text-zinc-900 disabled:opacity-30 disabled:hover:text-zinc-500 dark:text-zinc-400 dark:ring-white/10 dark:hover:text-white'
  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        aria-label="Move step up"
        className={iconBtn}
        disabled={index === 0}
        onClick={() => onMove(-1)}
      >
        <ChevronUpIcon className="size-4" />
      </button>
      <button
        type="button"
        aria-label="Move step down"
        className={iconBtn}
        disabled={index === count - 1}
        onClick={() => onMove(1)}
      >
        <ChevronDownIcon className="size-4" />
      </button>
      <button
        type="button"
        aria-label="Remove step"
        className={`${iconBtn} hover:text-red-600 dark:hover:text-red-400`}
        onClick={onRemove}
      >
        <TrashIcon className="size-4" />
      </button>
    </div>
  )
}

function StepHeader({ kind, seconds }: { kind: string; seconds: number }) {
  return (
    <div className="text-xs font-medium tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
      {kind} · {formatDuration(seconds)}
    </div>
  )
}

function TimerStepCard({
  step,
  index,
  count,
  update,
  move,
  remove,
}: {
  step: NormalStep
  index: number
  count: number
  update: (patch: Partial<NormalStep>) => void
  move: (dir: -1 | 1) => void
  remove: () => void
}) {
  return (
    <div className={cardClass}>
      <div className="flex items-start justify-between gap-4">
        <StepHeader kind="Timer" seconds={stepDurationSeconds(step)} />
        <StepControls
          index={index}
          count={count}
          onMove={move}
          onRemove={remove}
        />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-5">
        <NumberField
          label="Minutes"
          value={step.minutes}
          min={1}
          onChange={(minutes) => update({ minutes })}
        />
      </div>
    </div>
  )
}

function BreathStepCard({
  step,
  index,
  count,
  update,
  move,
  remove,
}: {
  step: BreathStep
  index: number
  count: number
  update: (patch: Partial<BreathStep>) => void
  move: (dir: -1 | 1) => void
  remove: () => void
}) {
  const invalid = !breathHasMotion(step)
  return (
    <div className={cardClass}>
      <div className="flex items-start justify-between gap-4">
        <StepHeader kind="Breath" seconds={stepDurationSeconds(step)} />
        <StepControls
          index={index}
          count={count}
          onMove={move}
          onRemove={remove}
        />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-5">
        <NumberField
          label="Inhale"
          value={step.inhale}
          min={0}
          onChange={(inhale) => update({ inhale })}
        />
        <NumberField
          label="Hold"
          value={step.holdIn}
          min={0}
          onChange={(holdIn) => update({ holdIn })}
        />
        <NumberField
          label="Exhale"
          value={step.exhale}
          min={0}
          onChange={(exhale) => update({ exhale })}
        />
        <NumberField
          label="Hold"
          value={step.holdOut}
          min={0}
          onChange={(holdOut) => update({ holdOut })}
        />
        <NumberField
          label="Cycles"
          value={step.cycles}
          min={1}
          onChange={(cycles) => update({ cycles })}
        />
      </div>
      {invalid && (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400">
          Add time to at least one segment.
        </p>
      )}
    </div>
  )
}

export function TimerClient() {
  const {
    steps,
    hydrated,
    addTimer,
    addBreath,
    updateStep,
    removeStep,
    moveStep,
    clearSteps,
    applyPreset,
  } = useTimerSteps()

  const canStart = steps.length > 0
  const total = steps.reduce((sum, s) => sum + stepDurationSeconds(s), 0)

  function startGesture() {
    // Prime audio + request true fullscreen inside the click, same as
    // PlayLink — so the player mounts unlocked and edge-to-edge.
    ensureAudioContext()
    enterPlayerFullscreen()
  }

  return (
    <article className="space-y-6">
      <SetBreadcrumbs items={[{ label: 'Timer' }]} />

      <PageToolbar
        title="Timer"
        splitMobileActions
        secondaryActions={
          <>
            <Button outline onClick={addTimer} className={toolbarButtonSize}>
              <PlusIcon data-slot="icon" />
              Timer
            </Button>
            <Button outline onClick={addBreath} className={toolbarButtonSize}>
              <PlusIcon data-slot="icon" />
              Breath
            </Button>
          </>
        }
        primaryAction={
          canStart ? (
            <Button
              href="/timer/play"
              color="emerald"
              onClick={startGesture}
              className={toolbarButtonSize}
            >
              Start ▶
            </Button>
          ) : (
            <Button color="emerald" disabled className={toolbarButtonSize}>
              Start ▶
            </Button>
          )
        }
      />

      {/* Empty on the static export until localStorage hydrates. */}
      {hydrated && steps.length === 0 && (
        <div className={`${cardClass} text-center`}>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Add a step using the buttons above.
          </p>
        </div>
      )}

      {steps.length > 0 && (
        <div className="space-y-4">
          {steps.map((step: TimerStep, index) =>
            step.kind === 'timer' ? (
              <TimerStepCard
                key={step.id}
                step={step}
                index={index}
                count={steps.length}
                update={(patch) => updateStep(step.id, patch)}
                move={(dir) => moveStep(step.id, dir)}
                remove={() => removeStep(step.id)}
              />
            ) : (
              <BreathStepCard
                key={step.id}
                step={step}
                index={index}
                count={steps.length}
                update={(patch) => updateStep(step.id, patch)}
                move={(dir) => moveStep(step.id, dir)}
                remove={() => removeStep(step.id)}
              />
            ),
          )}

          {/* Kept inside the steps list so the gap above it matches the
              gap between step cards (space-y-4). */}
          <div className="flex items-center justify-between rounded-2xl px-5 py-4 ring-1 ring-zinc-900/10 ring-inset dark:ring-white/10">
            <div className="text-xs font-medium tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
              Total · {formatDuration(total)}
            </div>
            <button
              type="button"
              aria-label="Clear all steps"
              onClick={clearSteps}
              className="flex size-8 items-center justify-center rounded-lg text-zinc-500 ring-1 ring-zinc-900/10 transition ring-inset hover:text-red-600 dark:text-zinc-400 dark:ring-white/10 dark:hover:text-red-400"
            >
              <TrashIcon className="size-4" />
            </button>
          </div>
        </div>
      )}

      {SHOW_PRESETS && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
            Presets
          </h2>
          <div className="space-y-3">
            {TIMER_PRESETS.map((preset) => (
              <div
                key={preset.title}
                className={`${cardClass} transition hover:bg-zinc-100 dark:hover:bg-white/5`}
              >
                {/* Stretched button covering the whole card applies the
                  preset. The content sits above it with pointer-events
                  disabled so clicks fall through — except the description
                  link, which re-enables pointer events (in presets.tsx)
                  and stays independently clickable. */}
                <button
                  type="button"
                  aria-label={`Load the ${preset.title} preset`}
                  onClick={() => applyPreset(preset)}
                  className="absolute inset-0 rounded-2xl focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none focus-visible:ring-inset"
                />
                <div className="pointer-events-none relative">
                  <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {preset.title}
                  </div>
                  {preset.description && (
                    <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
                      {preset.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </article>
  )
}
