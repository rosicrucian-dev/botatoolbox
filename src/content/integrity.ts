// Cross-file integrity checks. Each data file's own Zod schema validates
// shape; this file catches *references* that span files — a mantraSlug
// pointing at a non-existent word, a tarot card whose astrology field
// has no matching sign or planet, etc. Imported once for side effect
// from app/layout.tsx; throws at build/boot with an actionable message
// if anything is dangling.
//
// Add a new check here whenever you add a field that names a record in
// another data file.

import { sephiroth, paths, wordBySlug } from './data'
import { cards } from './data/tarot'
import { planets, signs } from './data/astrology'
import { sections as ritualSections } from './rituals/lrp'

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

// --- ritual word refs → words.slug
for (const section of ritualSections) {
  for (const line of section.lines) {
    for (const ref of line.wordIds) {
      expect(
        wordBySlug[ref] !== undefined,
        `ritual line "${line.text}" references word "${ref}" but it isn't in words.json`,
      )
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
