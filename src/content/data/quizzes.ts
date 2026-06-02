// Quiz catalog. Each quiz is self-describing: it carries its own item
// list (the things you cycle through), the dropdown answer options, and a
// per-item display (image or text). The player route reads this shape
// directly — no quiz-source-specific code in the player.
//
// To add a new quiz: either reuse an existing builder (e.g. another
// major-arcana attribute) or add a new builder for a new data source
// (minor arcana, astrology, anything else). Builders are kept here so
// the data layer stays the single source of truth.

import { cards, cardImage, type TarotCard } from './tarot'
import { minorCards, minorImage } from './index'
import { signs, planets, planetBySlug } from './astrology'

// Discriminated union for the left side of the player.
//   - `image` — tarot card image (majors). Optional `attribution`
//     surfaces a small "Image provided by …" caption under the image
//     (used by the third-party colored minor set).
//   - `text`  — plain label, e.g. "Ace of Wands" for minors.
//   - `glyph` — a single Unicode glyph rendered large with the same
//               grayscale-emoji styling used in astrology focus mode.
export type QuizDisplay =
  | {
      kind: 'image'
      src: string
      alt: string
      attribution?: { text: string; href: string }
    }
  | { kind: 'text'; text: string }
  | { kind: 'glyph'; glyph: string; alt: string }

export interface QuizItem {
  key: string
  // Shown in the player's prev/next nav.
  label: string
  display: QuizDisplay
  // Canonical answer — used by the Show button. Always counted correct.
  answer: string
  // Additional values that should also be counted correct. For items
  // where more than one value is valid (e.g. Scorpio has Mars + Pluto
  // as rulers). The canonical `answer` is implicitly accepted too.
  alsoAccepted?: ReadonlyArray<string>
}

export interface QuizCategory {
  slug: string
  label: string
}

export interface Quiz {
  slug: string
  // Display name on the index page + player header.
  title: string
  // Form label shown above the input. Often the singular of `title`
  // (e.g. "Keyword" vs "Keywords").
  fieldLabel: string
  categorySlug: string
  items: ReadonlyArray<QuizItem>
  // Deduped + sorted union of every item's answer — the dropdown set.
  answerOptions: ReadonlyArray<string>
}

export const quizCategories: ReadonlyArray<QuizCategory> = [
  { slug: 'major-arcana', label: 'Major Arcana' },
  { slug: 'minor-arcana', label: 'Minor Arcana' },
  { slug: 'signs', label: 'Signs' },
]

// ---------- builders ----------

function dedupSort(values: Iterable<string>): ReadonlyArray<string> {
  return Array.from(new Set(values)).sort()
}

// Quiz over the 22 majors, testing one string-valued field on TarotCard.
// Left side shows the card image.
function majorArcanaQuiz(opts: {
  slug: string
  title: string
  fieldLabel?: string
  field: keyof TarotCard
}): Quiz {
  const items: ReadonlyArray<QuizItem> = cards.map((c) => ({
    key: c.slug,
    label: c.name,
    display: { kind: 'image', src: cardImage(c), alt: c.name },
    answer: String(c[opts.field]),
  }))
  return {
    slug: opts.slug,
    title: opts.title,
    fieldLabel: opts.fieldLabel ?? opts.title,
    categorySlug: 'major-arcana',
    items,
    answerOptions: dedupSort(items.map((i) => i.answer)),
  }
}

// Keyword quiz over the minors. Pass a `suit` to limit to a single
// suit's 10 cards; omit it for the full 40-card "All Keywords" pool.
// Image goes on the left, same display treatment as the major-arcana
// quizzes. answerOptions are deduped + sorted within the chosen pool.
function minorArcanaKeywordsQuiz(opts: {
  slug: string
  title: string
  suit?: string
}): Quiz {
  // Quizzes only include cards that have a keyword in the data —
  // court cards (Page/Knight/Queen/King) carry an empty keyword and
  // are filtered out here so they don't end up as unanswerable items
  // or pollute the dropdown with empty strings.
  const cardsForQuiz = (
    opts.suit
      ? minorCards.filter((c) => c.suit === opts.suit)
      : minorCards
  ).filter((c) => c.keyword !== '')
  const items: ReadonlyArray<QuizItem> = cardsForQuiz.map((card) => {
    const label = `${card.num} of ${card.suit}`
    return {
      key: card.slug,
      label,
      display: {
        kind: 'image',
        src: minorImage(card),
        alt: label,
        attribution: {
          text: 'Josh Yates',
          href: 'https://cosmicrepository.z13.web.core.windows.net',
        },
      },
      answer: card.keyword,
    }
  })
  return {
    slug: opts.slug,
    title: opts.title,
    fieldLabel: 'Keyword',
    categorySlug: 'minor-arcana',
    items,
    answerOptions: dedupSort(items.map((i) => i.answer)),
  }
}

// Quiz over the 12 signs testing a string-valued attribute (bodyPart,
// quality, alchemy, …). Left side is the sign glyph. answerOptions is
// the dedup'd set of every sign's answer.
function signFieldQuiz(opts: {
  slug: string
  title: string
  fieldLabel: string
  answer: (s: (typeof signs)[number]) => string
}): Quiz {
  const items: ReadonlyArray<QuizItem> = signs.map((sign) => ({
    key: sign.slug,
    label: sign.name,
    display: { kind: 'glyph', glyph: sign.symbol, alt: sign.name },
    answer: opts.answer(sign),
  }))
  return {
    slug: opts.slug,
    title: opts.title,
    fieldLabel: opts.fieldLabel,
    categorySlug: 'signs',
    items,
    answerOptions: dedupSort(items.map((i) => i.answer)),
  }
}

// Sign-based quizzes where the answer is a planet — rulers, exaltations.
// `answerSlugs` returns the planet slugs that count as correct for a
// sign; first entry is canonical (filled by Show), rest are also-accepted.
// Returning null excludes the sign entirely (e.g. signs with no exaltation).
function signQuiz(opts: {
  slug: string
  title: string
  fieldLabel: string
  answerSlugs: (s: (typeof signs)[number]) => ReadonlyArray<string> | null
}): Quiz {
  const items: ReadonlyArray<QuizItem> = signs.flatMap((sign): QuizItem[] => {
    const slugs = opts.answerSlugs(sign)
    if (!slugs || slugs.length === 0) return []
    const [canonicalSlug, ...alts] = slugs
    return [
      {
        key: sign.slug,
        label: sign.name,
        display: { kind: 'glyph', glyph: sign.symbol, alt: sign.name },
        answer: planetBySlug[canonicalSlug].name,
        alsoAccepted:
          alts.length > 0
            ? alts.map((s) => planetBySlug[s].name)
            : undefined,
      },
    ]
  })
  return {
    slug: opts.slug,
    title: opts.title,
    fieldLabel: opts.fieldLabel,
    categorySlug: 'signs',
    items,
    // Every planet is in the dropdown — the user should be able to
    // search any planet name, not just the ones that happen to be
    // canonical rulers/exaltations.
    answerOptions: dedupSort(planets.map((p) => p.name)),
  }
}

// ---------- catalog ----------

export const quizzes: ReadonlyArray<Quiz> = [
  majorArcanaQuiz({
    slug: 'letter',
    title: 'Letter',
    field: 'letter',
  }),
  majorArcanaQuiz({
    slug: 'letter-significance',
    title: 'Letter Significance',
    field: 'significance',
  }),
  majorArcanaQuiz({
    slug: 'astrology',
    title: 'Astrology',
    field: 'astrology',
  }),
  majorArcanaQuiz({
    slug: 'alchemy',
    title: 'Alchemy',
    field: 'alchemy',
  }),
  majorArcanaQuiz({
    slug: 'intelligence',
    title: 'Intelligence',
    field: 'intelligence',
  }),
  majorArcanaQuiz({
    slug: 'power',
    title: 'Power',
    field: 'power',
  }),
  majorArcanaQuiz({
    slug: 'human-faculty',
    title: 'Human Faculty and Opposites',
    field: 'human',
  }),
  minorArcanaKeywordsQuiz({
    slug: 'wand-keywords',
    title: 'Wand Keywords',
    suit: 'Wands',
  }),
  minorArcanaKeywordsQuiz({
    slug: 'cup-keywords',
    title: 'Cup Keywords',
    suit: 'Cups',
  }),
  minorArcanaKeywordsQuiz({
    slug: 'sword-keywords',
    title: 'Sword Keywords',
    suit: 'Swords',
  }),
  minorArcanaKeywordsQuiz({
    slug: 'pentacle-keywords',
    title: 'Pentacle Keywords',
    suit: 'Pentacles',
  }),
  minorArcanaKeywordsQuiz({
    slug: 'all-keywords',
    title: 'All Keywords',
  }),
  signQuiz({
    slug: 'rulers',
    title: 'Rulers',
    fieldLabel: 'Ruler',
    answerSlugs: (s) => s.rulers,
  }),
  signQuiz({
    slug: 'exaltations',
    title: 'Exaltations',
    fieldLabel: 'Exaltation',
    // Returning null skips signs with no exaltation.
    answerSlugs: (s) => (s.exaltedBy ? [s.exaltedBy] : null),
  }),
  signFieldQuiz({
    slug: 'body',
    title: 'Body',
    fieldLabel: 'Body',
    answer: (s) => s.bodyPart,
  }),
  signFieldQuiz({
    slug: 'quality',
    title: 'Quality',
    fieldLabel: 'Quality',
    answer: (s) => s.quality,
  }),
  signFieldQuiz({
    slug: 'alchemy',
    title: 'Alchemy',
    fieldLabel: 'Alchemy',
    answer: (s) => s.alchemy,
  }),
]

export function quizBySlug(
  categorySlug: string,
  slug: string,
): Quiz | undefined {
  return quizzes.find(
    (q) => q.categorySlug === categorySlug && q.slug === slug,
  )
}
