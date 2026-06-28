'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { wordsForNumber } from '@/content/data'
import { theosophicExtension, theosophicReduction } from '@/lib/gematria'

const MAX_DIGITS = 4
// A derived value is clickable only up to this ceiling — the same as what
// the keypad can type — so chaining clicks (e.g. on Theosophic Extension,
// which grows fast) can't run off to ever-larger numbers.
const MAX_LINKABLE = 9999

// Normalize a raw digit string: keep digits only, drop leading zeros, cap
// length. Typing "007" → "7"; "0" alone → "" (the dictionary starts at 1).
function normalize(raw: string): string {
  return raw.replace(/\D/g, '').replace(/^0+/, '').slice(0, MAX_DIGITS)
}

const DIGITS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']

export function NumberDictionaryClient() {
  const router = useRouter()
  const sp = useSearchParams()

  // Mirror the typed number to ?n=… so it survives refresh / back-nav and
  // is shareable. URL is the source of truth; seed state from it on mount.
  const [digits, setDigits] = useState<string>(() =>
    normalize(sp.get('n') ?? ''),
  )

  useEffect(() => {
    const current = sp.get('n') ?? ''
    if (digits === current) return
    const params = new URLSearchParams(sp.toString())
    if (digits) params.set('n', digits)
    else params.delete('n')
    const qs = params.toString()
    router.replace(qs ? `?${qs}` : '?', { scroll: false })
  }, [digits, router, sp])

  const number = digits ? parseInt(digits, 10) : 0
  const entry = useMemo(() => wordsForNumber(number), [number])

  function press(d: string) {
    setDigits((cur) => normalize(cur + d))
  }
  function backspace() {
    setDigits((cur) => cur.slice(0, -1))
  }
  function clear() {
    setDigits('')
  }

  return (
    <article className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight dark:text-white">
        Dictionary
      </h1>

      {/* Number display. */}
      <div className="flex min-h-24 items-center justify-center rounded-2xl bg-zinc-50 px-6 py-6 ring-1 ring-zinc-900/5 md:min-h-32 dark:bg-zinc-800/40 dark:ring-white/10">
        <span
          className={`text-5xl font-medium tabular-nums md:text-7xl ${
            digits
              ? 'text-zinc-900 dark:text-white'
              : 'text-zinc-300 dark:text-zinc-600'
          }`}
        >
          {digits || '0'}
        </span>
      </div>

      {/* Number pad: all ten digits in a single row, each ~1/10 width. */}
      <div className="grid grid-cols-10 gap-1 md:gap-2">
        {DIGITS.map((d) => (
          <NumKey key={d} digit={d} onPress={press} />
        ))}
      </div>

      {/* Actions. */}
      <div className="flex justify-between gap-2">
        <ActionKey onClick={backspace}>Backspace</ActionKey>
        <ActionKey onClick={clear}>Clear</ActionKey>
      </div>

      {/* Theosophic extension + reduction for the current number. Each
          value is clickable — jumps the input to that number. */}
      {digits && (
        <div className="grid grid-cols-2 gap-3">
          <Stat
            label="Theosophic Extension"
            value={theosophicExtension(number)}
            onSelect={(n) => setDigits(String(n))}
          />
          <Stat
            label="Theosophic Reduction"
            value={theosophicReduction(number)}
            onSelect={(n) => setDigits(String(n))}
          />
        </div>
      )}

      {/* The Hebrew words for the current number. */}
      <Results number={number} entry={entry} hasInput={!!digits} />
    </article>
  )
}

function Stat({
  label,
  value,
  onSelect,
}: {
  label: string
  value: number
  onSelect: (n: number) => void
}) {
  return (
    <div className="rounded-2xl bg-zinc-50 px-5 py-4 text-center ring-1 ring-zinc-900/5 dark:bg-zinc-800/40 dark:ring-white/10">
      <div className="text-xs font-medium tracking-wide text-zinc-400 uppercase dark:text-zinc-500">
        {label}
      </div>
      {value <= MAX_LINKABLE ? (
        <button
          type="button"
          onClick={() => onSelect(value)}
          className="mt-1.5 inline-block text-3xl font-medium tabular-nums text-zinc-900 underline-offset-4 transition hover:underline dark:text-white"
        >
          {value}
        </button>
      ) : (
        <div className="mt-1.5 text-3xl font-medium tabular-nums text-zinc-900 dark:text-white">
          {value}
        </div>
      )}
    </div>
  )
}

function Results({
  number,
  entry,
  hasInput,
}: {
  number: number
  entry: ReturnType<typeof wordsForNumber>
  hasInput: boolean
}) {
  if (!hasInput) {
    return (
      <p className="py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
        Type a number above.
      </p>
    )
  }

  if (!entry || entry.words.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
        No words found for {number}.
      </p>
    )
  }

  const { words } = entry
  return (
    <div>
      <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
        {words.map((w, i) => (
          <li key={i} className="flex justify-between gap-6 py-4">
            {/* Left: stacked source blocks (Crowley first, then Strong's).
                Each appears only when that source has something to say. */}
            <div className="min-w-0 flex-1 space-y-2">
              {w.crowley && <Source label="Crowley" def={w.crowley} />}
              {w.strongs && (
                <Source label="Strong's" def={w.strongs} capitalize />
              )}
              {!w.strongs && !w.crowley && (
                <p className="text-sm text-zinc-400 italic dark:text-zinc-500">
                  No definition.
                </p>
              )}
            </div>
            {/* Right: the Hebrew word, aligned with the first source line. */}
            <span
              dir="rtl"
              lang="he"
              className="shrink-0 font-serif text-2xl leading-none text-zinc-900 md:text-3xl dark:text-white"
            >
              {w.hebrew}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Source({
  label,
  def,
  capitalize = false,
}: {
  label: string
  def: string
  capitalize?: boolean
}) {
  return (
    <div>
      <div className="text-xs font-medium tracking-wide text-zinc-400 uppercase dark:text-zinc-500">
        {label}
      </div>
      {/* Strong's glosses are lower-case in the source; first-letter:uppercase
          matches Crowley's capitalized style without mutating the data. */}
      <p
        className={`text-sm text-zinc-700 dark:text-zinc-300 ${
          capitalize ? 'first-letter:uppercase' : ''
        }`}
      >
        {def}
      </p>
    </div>
  )
}

function NumKey({
  digit,
  onPress,
  className = '',
}: {
  digit: string
  onPress: (d: string) => void
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={() => onPress(digit)}
      className={`flex h-12 items-center justify-center rounded-md bg-zinc-100 ring-1 ring-zinc-900/5 transition hover:bg-zinc-200 active:bg-zinc-300 md:h-16 dark:bg-zinc-800 dark:ring-white/10 dark:hover:bg-zinc-700 dark:active:bg-zinc-600 ${className}`}
    >
      <span className="text-lg font-medium tabular-nums text-zinc-900 md:text-2xl dark:text-white">
        {digit}
      </span>
    </button>
  )
}

function ActionKey({
  children,
  onClick,
}: {
  children: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-1 rounded-md bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 ring-1 ring-zinc-900/5 transition hover:bg-zinc-200 active:bg-zinc-300 md:text-base dark:bg-zinc-800 dark:text-white dark:ring-white/10 dark:hover:bg-zinc-700 dark:active:bg-zinc-600"
    >
      {children}
    </button>
  )
}
