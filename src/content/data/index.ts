// The data layer's single front door. Every domain has its own typed
// module that validates its JSON via Zod and exposes lookup maps; this
// index re-exports them all, and SERVER consumers outside the data layer
// import ONLY from `@/content/data` — never from the submodules.
//
// CLIENT components ('use client') must NOT value-import this barrel:
// the data modules parse their JSON (all locales) eagerly at load, so a
// single barrel import drags every dataset plus Zod into the browser
// bundle. Instead, client components
//   - receive data slices as props from their server-component parent,
//   - may `import type` from here (types are erased at build), and
//   - may value-import the dependency-free leaves `tarot-styles.ts`
//     and `tarot-images.ts`.
//
//   - tarot.ts         — major arcana + cardImage()/thumbImage()
//   - minor-arcana.ts  — minor arcana flat list + minorImage variants
//   - suit-correspondences.ts — tarot suit ↔ playing-card (Minor page)
//   - tarot-styles.ts  — art-style registry (drives Settings + downloads)
//   - sephiroth.ts     — the ten sephiroth + descent order
//   - tree-paths.ts    — connecting paths (11–32)
//   - words.ts         — words of power
//   - signs.ts         — raw zodiac records (healing views)
//   - planets.ts       — raw planet records, chakra order (healing views)
//   - astrology.ts     — signs/planets joined with their tarot card
//                        (astrologySigns / astrologyPlanets)
//   - meditations.ts   — Tarot Fundamentals + Supersensory Powers
//   - grades.ts        — grade ladder + sephirah lookup
//   - houses.ts        — the twelve astrological houses (Astrology page)
//   - chakras.ts       — chakra ↔ planet/angel table
//   - elements.ts      — the four classical elements + qualities
//   - gunas.ts         — the three gunas / tria prima (Elements page)
//   - numerology.ts    — number attributions
//   - cube-of-space.ts — Cube of Space edge/face attributions + flows
//   - three-veils.ts   — the Three Veils of Negative Existence
//   - four-worlds.ts   — the four Qabalistic worlds (Qabalah page)
//   - pillars.ts       — the two pillars (Qabalah page)
//   - ten-palaces.ts   — the Ten Palaces of Assiah (Qabalah page)
//   - texts.ts         — prose-text manifest (bodies in content/texts/*.md)
//   - rituals.ts       — ritual manifest + markdown parser
//   - quizzes.ts       — quiz definitions (code, not JSON — see README)
//   - gematria-words.ts / gematria-sources.ts — gematria dictionary
//   - helpers.ts       — byKey<T>() and other shared utilities
//
//   - alchemy.ts       — alchemical-term glossary
//
// All schemas live in ./schemas.ts; cross-file integrity in ../integrity.ts.

export * from './alchemy'
export * from './astrology'
export * from './chakras'
export * from './cube-of-space'
export * from './elements'
export * from './files'
export * from './four-worlds'
export * from './gematria-sources'
export * from './gematria-words'
export * from './grades'
export * from './gunas'
export * from './houses'
export * from './meditations'
export * from './minor-arcana'
export * from './numerology'
export * from './pillars'
export * from './planets'
export * from './quizzes'
export * from './recordings'
export * from './rituals'
export * from './sephiroth'
export * from './signs'
export * from './suit-correspondences'
export * from './tarot'
export * from './tarot-styles'
export * from './ten-palaces'
export * from './texts'
export * from './three-veils'
export * from './tree-paths'
export * from './words'
