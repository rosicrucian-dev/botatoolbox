'use client'

import { useMemo } from 'react'

import { wordsForNumber, type GematriaNumberEntry } from '@/content/data'
import { GEMATRIA_SOURCES } from '@/content/data/gematria-sources'
import { theosophicExtension, theosophicReduction } from '@/lib/gematria'
import { useGematriaDict } from '@/lib/useGematriaDict'
import { useQueryParamState } from '@/lib/useQueryParamState'
import { GematriaNoteSection } from '@/components/GematriaNoteSection'
import { GematriaWordSection } from '@/components/GematriaWordSection'
import { GematriaSources } from '@/components/GematriaSources'

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
  // Mirror the typed number to ?n=… so it survives refresh / back-nav and is
  // shareable. `normalize` keeps the param clean (digits only, no leading
  // zeros, capped length).
  const [digits, setDigits] = useQueryParamState('n', normalize, (s) => s)

  const number = digits ? parseInt(digits, 10) : 0
  const dict = useGematriaDict()
  const entry = useMemo(
    () => (dict ? wordsForNumber(dict, number) : undefined),
    [dict, number],
  )

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
      <Results
        number={number}
        entry={entry}
        hasInput={!!digits}
        loading={!dict}
      />

      {entry && entryHasContent(entry) && <GematriaSources />}
    </article>
  )
}

// Whether a number entry has anything to show from any source.
function entryHasContent(entry: GematriaNumberEntry): boolean {
  if (entry.significance) return true
  if (entry.notes && Object.keys(entry.notes).length > 0) return true
  if (entry.words && Object.values(entry.words).some((w) => w.length > 0))
    return true
  return false
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
  loading,
}: {
  number: number
  entry: ReturnType<typeof wordsForNumber>
  hasInput: boolean
  loading: boolean
}) {
  if (!hasInput) {
    return (
      <p className="py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
        Type a number above.
      </p>
    )
  }

  if (loading) {
    return (
      <p className="py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
        Looking up&hellip;
      </p>
    )
  }

  if (!entry || !entryHasContent(entry)) {
    return (
      <p className="py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
        No words found for {number}.
      </p>
    )
  }

  // Each source's take on this number, in registry order: Paul Case notes
  // first (number-keyed prose), then Crowley and Strong's word lists. Nothing
  // is merged — every source is listed on its own.
  return (
    <div className="space-y-6">
      {GEMATRIA_SOURCES.map((source) => {
        if (source.kind === 'note') {
          const text = entry.notes?.[source.id]
          return text ? (
            <GematriaNoteSection
              key={source.id}
              label={source.label}
              text={text}
            />
          ) : null
        }
        const words = entry.words?.[source.id] ?? []
        // The number's own Sepher Sephiroth note is Crowley-sourced, so it
        // leads the Crowley section as its first row.
        const note = source.id === 'crowley' ? entry.significance : undefined
        return words.length > 0 || note ? (
          <GematriaWordSection
            key={source.id}
            label={source.label}
            words={words}
            note={note}
          />
        ) : null
      })}
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
