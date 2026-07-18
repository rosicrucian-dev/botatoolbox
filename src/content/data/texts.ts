// Prose texts manifest. The markdown bodies live in content/texts/*.md
// (German: content/texts/de/*.md); this lists them with display titles
// and ordering. The generic /texts/[slug] route reads the matching .md
// at build. German titles/descriptions come from `de/texts.json` via
// getTexts(locale); the top-level exports stay pinned to English. See
// README.md.

import { z } from 'zod'

import textsData from '@content/data/en/texts.json'

import { byKey } from './helpers'
import { defineLocalized } from './localized'
import { localizedRaw } from './overlay'
import { TextSchema } from './schemas'

export type Text = z.infer<typeof TextSchema>

const rawFor = localizedRaw('texts', textsData)

export const getTexts = defineLocalized((locale) => {
  const texts: ReadonlyArray<Text> = z.array(TextSchema).parse(rawFor(locale))

  const textBySlug = byKey(texts, 'slug', 'text.slug')

  // Texts shown in nav / home TOC / sitemap (everything not flagged hidden).
  const visibleTexts: ReadonlyArray<Text> = texts.filter((t) => !t.hidden)

  return { texts, textBySlug, visibleTexts }
})
