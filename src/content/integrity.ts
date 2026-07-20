// Cross-file integrity checks. Each data file's own Zod schema validates
// shape; this file catches *references* that span files — a mantraSlug
// pointing at a non-existent word, a tarot card whose astrology field
// has no matching sign or planet, etc. Imported once for side effect
// from app/layout.tsx; throws at build/boot with an actionable message
// if anything is dangling.
//
// Add a new check here whenever you add a field that names a record in
// another data file.

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { romanToLetters } from '@/lib/hebrew'
import { DEFAULT_LOCALE, LOCALES } from '@/lib/locales'
import { getNavigation } from '@/lib/nav'
import {
  cubeEdges,
  cubeFaces,
  getChakras,
  getFiles,
  getGrades,
  getMeditations,
  getMinorArcana,
  getPlanets,
  getRecordings,
  getRituals,
  getSephiroth,
  getSigns,
  getTarot,
  getTexts,
  getWords,
  isRestDay,
  MAJOR_STYLES,
  MINOR_STYLES,
  parseRitual,
  paths,
} from './data'

// Integrity checks validate the ENGLISH source of truth on purpose —
// slugs, foreign keys, and manifest↔file bijections are structural and
// identical across locales (overlays can't touch them; see overlay.ts).
const { cards, cardByLetter } = getTarot(DEFAULT_LOCALE)
const { minorCards } = getMinorArcana(DEFAULT_LOCALE)
const { chakras } = getChakras(DEFAULT_LOCALE)
const { fileBySlug } = getFiles(DEFAULT_LOCALE)
const { grades } = getGrades(DEFAULT_LOCALE)
const { planets } = getPlanets(DEFAULT_LOCALE)
const { signs } = getSigns(DEFAULT_LOCALE)
const { sephiroth } = getSephiroth(DEFAULT_LOCALE)
const { rituals } = getRituals(DEFAULT_LOCALE)
const { texts } = getTexts(DEFAULT_LOCALE)
const { recordings } = getRecordings(DEFAULT_LOCALE)
const { wordBySlug } = getWords(DEFAULT_LOCALE)
const { supersensoryMeditations, tarotFundamentalsDays } =
  getMeditations(DEFAULT_LOCALE)
const navigation = getNavigation(DEFAULT_LOCALE)

function fail(msg: string): never {
  throw new Error(`Data integrity error: ${msg}`)
}

function expect(condition: boolean, msg: string) {
  if (!condition) fail(msg)
}

// --- sephiroth.mantraSlug → words.slug
for (const s of sephiroth) {
  expect(
    wordBySlug[s.mantraSlug] !== undefined,
    `sephirah ${s.slug}.mantraSlug = "${s.mantraSlug}" has no matching word in words.json`,
  )
}

// --- manifest ↔ markdown files, both directions. A manifest entry with
// no .md fails the page render anyway, but an orphan .md would otherwise
// be a silent no-op — the most likely contributor mistake.
function expectManifestMatchesDir(
  kind: 'texts' | 'rituals' | 'recordings',
  slugs: ReadonlyArray<string>,
) {
  const dir = join(process.cwd(), 'content', kind, DEFAULT_LOCALE)
  const files = readdirSync(dir).filter((f) => f.endsWith('.md'))
  for (const slug of slugs) {
    expect(
      files.includes(`${slug}.md`),
      `${kind}.json lists "${slug}" but content/${kind}/${DEFAULT_LOCALE}/${slug}.md is missing`,
    )
  }
  const known = new Set(slugs)
  for (const f of files) {
    expect(
      known.has(f.replace(/\.md$/, '')),
      `content/${kind}/${DEFAULT_LOCALE}/${f} has no entry in content/data/${kind}.json — it won't render anywhere. Add a manifest entry (or delete the file).`,
    )
  }
}
expectManifestMatchesDir(
  'texts',
  texts.map((t) => t.slug),
)
expectManifestMatchesDir(
  'rituals',
  rituals.map((r) => r.slug),
)
expectManifestMatchesDir(
  'recordings',
  recordings.map((r) => r.slug),
)

// --- translation markdown (content/<kind>/<locale>/), warnings only.
// A missing translation is normal (falls back to English); an orphan
// (a de/ file whose English source was renamed/removed) means finished
// work that silently stopped rendering — surface it, but never fail
// the build over a translation file.
for (const [kind, slugs] of [
  ['texts', texts.map((t) => t.slug)],
  ['rituals', rituals.map((r) => r.slug)],
] as const) {
  for (const locale of LOCALES) {
    if (locale === DEFAULT_LOCALE) continue
    const dir = join(process.cwd(), 'content', kind, locale)
    if (!existsSync(dir)) continue
    const known = new Set(slugs)
    for (const f of readdirSync(dir).filter((n) => n.endsWith('.md'))) {
      if (!known.has(f.replace(/\.md$/, ''))) {
        console.warn(
          `[i18n] content/${kind}/${locale}/${f} has no matching English file — was the English source renamed? This translation no longer renders.`,
        )
      }
    }
  }
}

// --- ritual musicFileSlug → files.slug
for (const ritual of rituals) {
  if (ritual.musicFileSlug) {
    expect(
      fileBySlug[ritual.musicFileSlug] !== undefined,
      `ritual "${ritual.slug}".musicFileSlug = "${ritual.musicFileSlug}" has no matching entry in files.json`,
    )
  }
}

// --- ritual word refs → words.slug
for (const ritual of rituals) {
  const md = readFileSync(
    join(process.cwd(), 'content/rituals', DEFAULT_LOCALE, `${ritual.slug}.md`),
    'utf8',
  )
  for (const section of parseRitual(md)) {
    for (const line of section.lines) {
      for (const ref of line.wordIds) {
        expect(
          wordBySlug[ref] !== undefined,
          `ritual "${ritual.slug}" line "${line.text}" references word "${ref}" but it isn't in words.json`,
        )
      }
    }
  }
}

// --- tree-paths.slug → tarot.slug
const cardSlugs = new Set(cards.map((c) => c.slug))
for (const p of paths) {
  expect(
    cardSlugs.has(p.slug),
    `tree-path "${p.slug}" doesn't match any tarot card slug`,
  )
}

// --- meditations-tarot-fundamentals: shape + card-slug refs
{
  const days = tarotFundamentalsDays.map((d) => d.day).sort((a, b) => a - b)
  expect(
    days.length === 28 && days.every((d, i) => d === i + 1),
    `meditations-tarot-fundamentals.json must have exactly days 1..28`,
  )
  for (const d of tarotFundamentalsDays) {
    for (const cardSlug of d.cards) {
      expect(
        cardSlugs.has(cardSlug),
        `meditations day ${d.day} references card "${cardSlug}" but no tarot card has that slug`,
      )
    }
    if (isRestDay(d.day)) {
      expect(
        d.cards.length === 0 && d.paragraph === '' && d.affirmation === '',
        `meditations day ${d.day} is a rest day — cards/paragraph/affirmation must be empty`,
      )
    }
  }
}

// --- cube-of-space: edge cards must be zodiac (simple letter) cards
// covering all 12 signs; face cards must be the six classical double-letter
// planets, each used once (Saturn belongs at the center, and the modern
// octaves — Uranus/Neptune/Pluto — never sit on the cube). Structure:
// every edge borders exactly two faces, and each flow direction must lie
// along its edge's geometric axis.
{
  const signNamesLower = new Set(signs.map((s) => s.name.toLowerCase()))
  const seenSigns = new Set<string>()
  for (const e of cubeEdges) {
    const card = cards.find((c) => c.slug === e.cardSlug)
    expect(
      card !== undefined,
      `cube edge ${e.id} references card "${e.cardSlug}" but no tarot card has that slug`,
    )
    const sign = card!.astrology.toLowerCase()
    expect(
      signNamesLower.has(sign),
      `cube edge ${e.id} card "${e.cardSlug}" is attributed to "${card!.astrology}" — edges must carry zodiac cards`,
    )
    expect(!seenSigns.has(sign), `cube edges assign "${card!.astrology}" twice`)
    seenSigns.add(sign)
  }

  const FACE_PLANETS = new Set([
    'mercury',
    'moon',
    'venus',
    'jupiter',
    'mars',
    'sun',
  ])
  const seenFaceCards = new Set<string>()
  for (const f of cubeFaces) {
    const card = cards.find((c) => c.slug === f.cardSlug)
    expect(
      card !== undefined,
      `cube face ${f.id} references card "${f.cardSlug}" but no tarot card has that slug`,
    )
    expect(
      FACE_PLANETS.has(card!.astrology.toLowerCase()),
      `cube face ${f.id} card "${f.cardSlug}" is attributed to "${card!.astrology}" — faces carry the six classical double-letter planets`,
    )
    expect(
      !seenFaceCards.has(f.cardSlug),
      `cube faces assign "${f.cardSlug}" twice`,
    )
    seenFaceCards.add(f.cardSlug)
  }

  // Every edge must border exactly two faces.
  const borderCounts = new Map<string, number>()
  for (const f of cubeFaces) {
    for (const edgeId of Object.values(f.borders)) {
      borderCounts.set(edgeId, (borderCounts.get(edgeId) ?? 0) + 1)
    }
  }
  for (const e of cubeEdges) {
    expect(
      borderCounts.get(e.id) === 2,
      `cube edge ${e.id} appears ${borderCounts.get(e.id) ?? 0}× across face borders — every edge borders exactly two faces`,
    )
  }

  // Flow must run along the edge's own axis: T-E/B-E/T-W/B-W run
  // north–south, T-N/T-S/B-N/B-S run east–west, corner edges run
  // vertically.
  const axisFor = (id: string): ReadonlyArray<string> =>
    id.length === 2
      ? ['up', 'down']
      : id.endsWith('E') || id.endsWith('W')
        ? ['north', 'south']
        : ['east', 'west']
  for (const e of cubeEdges) {
    expect(
      axisFor(e.id).includes(e.flow),
      `cube edge ${e.id} flow "${e.flow}" doesn't lie along the edge's axis (expected ${axisFor(e.id).join('/')})`,
    )
  }
}

// --- tarot.astrology → either a sign name or a planet name
const planetNames = new Set(planets.map((p) => p.name))
const signNames = new Set(signs.map((s) => s.name))
for (const c of cards) {
  expect(
    planetNames.has(c.astrology) || signNames.has(c.astrology),
    `tarot card "${c.name}".astrology = "${c.astrology}" is neither a planet nor a sign`,
  )
}

// --- sign rulers / exaltedBy → planet slugs
const planetSlugs = new Set(planets.map((p) => p.slug))
for (const s of signs) {
  for (const ruler of s.rulers) {
    expect(
      planetSlugs.has(ruler),
      `sign "${s.slug}".rulers includes "${ruler}" but no planet has that slug`,
    )
  }
  if (s.exaltedBy !== null) {
    expect(
      planetSlugs.has(s.exaltedBy),
      `sign "${s.slug}".exaltedBy = "${s.exaltedBy}" but no planet has that slug`,
    )
  }
}

// --- planet rules / exaltedIn → sign slugs
const signSlugs = new Set(signs.map((s) => s.slug))
for (const p of planets) {
  for (const ruled of p.rules) {
    expect(
      signSlugs.has(ruled),
      `planet "${p.slug}".rules includes "${ruled}" but no sign has that slug`,
    )
  }
  if (p.exaltedIn !== null) {
    expect(
      signSlugs.has(p.exaltedIn),
      `planet "${p.slug}".exaltedIn = "${p.exaltedIn}" but no sign has that slug`,
    )
  }
}

// --- grades.sephirah → sephirah slug
const sephirahSlugs = new Set(sephiroth.map((s) => s.slug))
for (const g of grades) {
  if (g.sephirah !== null) {
    expect(
      sephirahSlugs.has(g.sephirah),
      `grade "${g.slug}".sephirah = "${g.sephirah}" has no matching sephirah`,
    )
  }
}

// --- grade.intelligenceRoman + sephirah.hebrewRoman → must parse to
// letters that exist in tarot.json. Catches a typo'd capitalization
// (e.g. "ShPo" instead of "ShPO") that would silently drop a letter
// from the rendered key strip.
function expectLettersParse(label: string, roman: string) {
  const parsed = romanToLetters(roman)
  // Stripped chars: every alpha char in roman should be consumed.
  const expected = roman.replace(/[^A-Za-z]/g, '').length
  const consumed = parsed.reduce((n, name) => {
    if (
      name === 'Cheth' ||
      name === 'Shin' ||
      name === 'Tav' ||
      name === 'Tzaddi'
    ) {
      // Two-char codes: Ch, Sh, Th, Tz
      return n + 2
    }
    return n + 1
  }, 0)
  expect(
    consumed === expected,
    `${label}: romanization "${roman}" has unknown letter(s) — parsed ${consumed}/${expected} chars`,
  )
  for (const letter of parsed) {
    expect(
      cardByLetter[letter] !== undefined,
      `${label}: letter "${letter}" (from "${roman}") has no matching tarot card`,
    )
  }
}
for (const g of grades) {
  if (g.intelligenceRoman) {
    expectLettersParse(
      `grade "${g.slug}".intelligenceRoman`,
      g.intelligenceRoman,
    )
  }
}
for (const s of sephiroth) {
  if (s.hebrewRoman) {
    expectLettersParse(`sephirah "${s.slug}".hebrewRoman`, s.hebrewRoman)
  }
}

// --- supersensory meditation slug → tarot card slug (caught the
// hanged-man bug after the fact; bake it in so it can't recur).
for (const m of supersensoryMeditations) {
  expect(
    cardSlugs.has(m.slug),
    `supersensory meditation "${m.slug}" doesn't match any major arcana slug`,
  )
}

// --- card images exist for every registered art style. Image paths are
// derived from slugs (never stored), so a renamed slug or misnamed file
// would otherwise ship as a silently broken <img>.
{
  const pub = join(process.cwd(), 'public')
  for (const style of MAJOR_STYLES) {
    for (const c of cards) {
      for (const rel of [
        `tarot/major/${style.id}/${c.num}-${c.slug}.jpg`,
        `tarot/major/${style.id}/thumbs/${c.num}-${c.slug}.jpg`,
      ]) {
        expect(
          existsSync(join(pub, rel)),
          `missing image public/${rel} for card "${c.slug}" (style "${style.id}")`,
        )
      }
    }
  }
  for (const style of MINOR_STYLES) {
    for (const m of minorCards) {
      const rel = `tarot/minor/${style.id}/${m.slug}.jpg`
      expect(
        existsSync(join(pub, rel)),
        `missing image public/${rel} for minor card "${m.slug}" (style "${style.id}")`,
      )
    }
  }
}

// --- chakra.planet → planet slug
for (const c of chakras) {
  expect(
    planetSlugs.has(c.planet),
    `chakra row angel="${c.angel}" planet="${c.planet}" has no matching planet`,
  )
}

// --- two-tier URL scheme (see NavGroup.flat in lib/nav.ts). A `flat` group
// serves each member at a short top-level URL plus a grouped re-export alias;
// every other group is single-URL nested. Enforce the href shape for both,
// and — for flat groups — that the grouped alias page actually exists, so a
// dual URL can never silently 404 or drift out of sync with the nav.
{
  const docsDir = join(process.cwd(), 'src/app/[locale]/(docs)')
  for (const group of navigation) {
    const slug = group.slug
    for (const link of group.links) {
      const segs = link.href.split('/').filter(Boolean)
      if (group.flat) {
        expect(
          segs.length === 1,
          `flat group "${group.title}" member ${link.href} must be a single top-level segment (e.g. /${segs[0] ?? ''})`,
        )
        // Canonical short URL lives at (docs)/<item>/; the grouped alias must
        // exist at (docs)/<group>/<item>/page.tsx as a re-export of it.
        expect(
          existsSync(join(docsDir, slug, segs[0], 'page.tsx')),
          `flat group "${group.title}" member ${link.href} is missing its grouped alias at (docs)/${slug}/${segs[0]}/page.tsx`,
        )
      } else {
        expect(
          segs.length >= 2 && segs[0] === slug,
          `nested group "${group.title}" member ${link.href} must be nested as /${slug}/<item> (single-URL, no top-level alias)`,
        )
      }
    }
  }
}
