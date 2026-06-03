'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { SlidePlayer } from '@/components/SlidePlayer'
import { InlineCombobox } from '@/components/InlineCombobox'
import { type Quiz, type QuizItem } from '@/content/data/quizzes'
import { usePlayerIndex } from '@/lib/usePlayerIndex'

// Fisher-Yates shuffle. Returns a new array; input is untouched.
function shuffle<T>(arr: ReadonlyArray<T>): Array<T> {
  const out = arr.slice()
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

// Live boolean for "screen narrow enough to call mobile". Drives
// per-quiz answer abbreviation (e.g. Intelligence → I). Initial value
// is false for SSR; the real value flips in after mount.
function useIsCompactScreen() {
  const [isCompact, setIsCompact] = useState(false)
  useEffect(() => {
    const mql = window.matchMedia('(max-width: 768px)')
    setIsCompact(mql.matches)
    const handler = (e: MediaQueryListEvent) => setIsCompact(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])
  return isCompact
}

// Per-quiz display transforms applied to combobox answers when the
// screen is compact. Comparison still uses raw values — this is only
// what the user sees in the dropdown and the selected input. Keep this
// in the client component (not on Quiz itself) since functions can't
// cross the server→client boundary in RSC.
const COMPACT_FORMATTERS: Record<string, (answer: string) => string> = {
  intelligence: (a) => a.replace(/Intelligence/g, 'I'),
}

// Per-card response.
//   - `pick` is the last user selection (drives ring color + result text).
//   - `status` is the locked scoring outcome for this card. Two events
//     can lock it: a wrong pick → 'disqualified', or clicking Show on
//     an unanswered card → 'disqualified'. A correct pick on an
//     unanswered card → 'earned'. Once locked, status never changes —
//     so getting it right after a wrong attempt can't earn the point
//     back, and an already-earned point can't be lost. Skipping via
//     Next does NOT disqualify — the user can come back via Prev and
//     still earn the point.
interface Response {
  pick: { given: string; correct: boolean; revealed: boolean } | null
  status: 'unanswered' | 'earned' | 'disqualified'
}

// Player slide. Quiz items come first; a single Finish slide is appended
// so the last question's Next button surfaces "Finish" as its label
// (SlidePlayer already renders slides[idx + 1].label under Next).
type Slide =
  | (QuizItem & { kind: 'question' })
  | { kind: 'finish'; key: 'finish'; label: 'Finish' }

export function QuizPlayer({ quiz }: { quiz: Quiz }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const randomize = searchParams.get('random') === '1'
  const isCompact = useIsCompactScreen()
  const compactFormatter = isCompact ? COMPACT_FORMATTERS[quiz.slug] : undefined
  const formatForDisplay = (v: string | null) => {
    if (v == null) return ''
    return compactFormatter ? compactFormatter(v) : v
  }

  // Shuffle once per mount when randomize is on. Stable for the lifetime
  // of this player so prev/next walks the same order. Recomputed if the
  // randomize flag flips or the quiz changes.
  const items = useMemo(
    () => (randomize ? shuffle(quiz.items) : quiz.items),
    [quiz, randomize],
  )

  const slides = useMemo<ReadonlyArray<Slide>>(
    () => [
      ...items.map((item): Slide => ({ ...item, kind: 'question' })),
      { kind: 'finish', key: 'finish', label: 'Finish' },
    ],
    [items],
  )

  const { idx, handleIdxChange } = usePlayerIndex({
    slidesLength: slides.length,
  })

  const [responses, setResponses] = useState<Array<Response>>(
    () => items.map(() => ({ pick: null, status: 'unanswered' })),
  )

  const currentSlide = slides[idx]
  const isFinish = currentSlide.kind === 'finish'
  const currentItem = isFinish ? null : currentSlide
  const response = isFinish ? null : responses[idx]

  const earnedCount = responses.filter((r) => r.status === 'earned').length
  const totalQuestions = items.length
  // Title shows "<title> <n>/<total> - Score: <earned>" on question
  // slides; on Finish it's just the quiz title.
  const headerTitle = isFinish
    ? quiz.title
    : `${quiz.title} ${idx + 1}/${totalQuestions} - Score: ${earnedCount}`

  function onPick(value: string | null) {
    if (value === null || !currentItem) return
    const correct =
      value === currentItem.answer ||
      currentItem.alsoAccepted?.includes(value) === true
    setResponses((prev) => {
      const next = prev.slice()
      const cur = next[idx]
      // Lock status on the first pick: correct → earned, wrong → disqualified.
      // Subsequent picks update the displayed value but never change status.
      const nextStatus =
        cur.status === 'unanswered'
          ? correct
            ? 'earned'
            : 'disqualified'
          : cur.status
      next[idx] = {
        pick: { given: value, correct, revealed: false },
        status: nextStatus,
      }
      return next
    })
  }

  function onShow() {
    if (!currentItem) return
    setResponses((prev) => {
      const next = prev.slice()
      const cur = next[idx]
      next[idx] = {
        pick: { given: currentItem.answer, correct: true, revealed: true },
        // Show on an unanswered card disqualifies it. If already earned
        // or disqualified, leave that decision alone.
        status: cur.status === 'unanswered' ? 'disqualified' : cur.status,
      }
      return next
    })
  }

  return (
    <SlidePlayer
      title={headerTitle}
      slides={slides}
      idx={idx}
      onIdxChange={handleIdxChange}
      onClose={() => router.push('/quiz')}
      disableClickToAdvance
      renderFull={(slide) =>
        slide.kind === 'finish' ? (
          // Centered full-width summary — escapes the left/right split.
          <div className="text-center text-zinc-900 dark:text-zinc-100">
            <h2 className="text-4xl font-semibold tracking-tight md:text-5xl">
              Finished!
            </h2>
            <p className="text-2xl font-medium">
              Score: {earnedCount}/{totalQuestions}
            </p>
          </div>
        ) : null
      }
      renderLeft={(slide) =>
        slide.kind === 'finish' ? null : <ItemDisplay item={slide} />
      }
      renderRight={(slide) => {
        if (slide.kind === 'finish') return null
        return (
          <div
            // Remount on slide change so the combobox input + any
            // transient UI state clears between cards.
            key={idx}
            className="w-full max-w-sm px-4 text-left text-zinc-900 dark:text-zinc-100"
          >
            <label
              htmlFor={`quiz-${quiz.slug}`}
              className="mb-2 block text-xs font-bold tracking-wide uppercase text-zinc-700 dark:text-zinc-300"
            >
              {quiz.fieldLabel}
            </label>
            <InlineCombobox<string>
              id={`quiz-${quiz.slug}`}
              options={quiz.answerOptions}
              value={response?.pick?.given ?? null}
              onChange={onPick}
              displayValue={formatForDisplay}
              placeholder="Type to search…"
              aria-label={quiz.fieldLabel}
              autoFocus
              status={
                !response?.pick
                  ? 'idle'
                  : response.pick.correct
                    ? 'valid'
                    : 'invalid'
              }
              trailing={
                <button
                  type="button"
                  onClick={onShow}
                  className="px-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 focus:outline-none focus:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-700/60 dark:focus:bg-zinc-700/60"
                >
                  Show
                </button>
              }
            />
            <p className="mt-2 h-6 text-xs italic">
              {response?.pick && !response.pick.revealed ? (
                response.pick.correct ? (
                  <span className="text-green-600 dark:text-green-400">
                    Correct!
                  </span>
                ) : (
                  <span className="text-red-600 dark:text-red-400">
                    Incorrect
                  </span>
                )
              ) : null}
            </p>
          </div>
        )
      }}
    />
  )
}

// Renders the left side of a quiz slide. Discriminates on
// QuizItem.display: image for majors, glyph for signs (large grayscale
// emoji, same sizing as astrology focus mode), text for everything else.
function ItemDisplay({ item }: { item: QuizItem }) {
  if (item.display.kind === 'image') {
    const attribution = item.display.attribution
    return (
      <div className="flex flex-col items-center gap-1">
        <img
          src={item.display.src}
          alt={item.display.alt}
          // max-h dropped slightly from 33svh / 50vh to leave room for
          // the attribution caption when present.
          className="max-h-[30svh] max-w-full rounded-lg object-contain md:max-h-[47vh] md:max-w-[280px]"
        />
        {attribution && (
          <p className="text-center text-xs opacity-70">
            Image provided by{' '}
            <a
              href={attribution.href}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2"
            >
              {attribution.text}
            </a>
            .
          </p>
        )}
      </div>
    )
  }
  if (item.display.kind === 'glyph') {
    // Hebrew letter style — larger, serif, rtl. Matches the
    // major-arcana focus-mode rendering exactly.
    if (item.display.style === 'hebrew') {
      return (
        <div
          className="text-center font-serif text-[min(22vh,55vw)] leading-none md:text-[min(40vh,80vw)]"
          dir="rtl"
          lang="he"
          aria-label={item.display.alt}
        >
          {item.display.glyph}
        </div>
      )
    }
    // Default 'sign' style — sizing + grayscale match
    // AstrologyFocusPlayer's glyph rendering so zodiac emoji look the
    // same here as in focus mode.
    return (
      <div
        className="text-center text-[min(15vh,35vw)] leading-tight grayscale md:text-[min(22vh,40vw)]"
        aria-label={item.display.alt}
      >
        {item.display.glyph}
      </div>
    )
  }
  return (
    <div className="px-4 text-center text-3xl font-semibold tracking-tight md:text-4xl">
      {item.display.text}
    </div>
  )
}
