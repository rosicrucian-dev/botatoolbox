import { type TimerPreset } from '@/lib/timer'

// Baked-in Timer presets. Data (not a component), but a .tsx because the
// descriptions carry inline links. Titles + optional descriptions only.
export const TIMER_PRESETS: ReadonlyArray<TimerPreset> = [
  {
    title: 'Qabalistic Meditation',
    description: (
      <>
        See the lesson{' '}
        <a
          href="https://agelesswisdom.school/esoteric-secrets-of-meditation/qabalistic-meditation/"
          target="_blank"
          rel="noreferrer"
          className="pointer-events-auto font-medium text-zinc-900 underline-offset-2 hover:underline dark:text-zinc-100"
        >
          Qabalistic Meditation
        </a>{' '}
        from The School of Ageless Wisdom.
      </>
    ),
    steps: [
      {
        kind: 'breath',
        inhale: 4,
        holdIn: 16,
        exhale: 8,
        holdOut: 0,
        cycles: 10,
      },
      { kind: 'timer', minutes: 5 },
      { kind: 'timer', minutes: 5 },
      { kind: 'timer', minutes: 5 },
    ],
  },
]
