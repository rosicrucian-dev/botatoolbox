// Prose texts manifest. The markdown bodies live in content/texts/*.md;
// this lists them with display titles and ordering. The generic
// /texts/[slug] route reads the matching .md at build. See README.md.

import { z } from 'zod'

import textsData from '@content/data/texts.json'
import { byKey } from './helpers'
import { TextSchema } from './schemas'

export type Text = z.infer<typeof TextSchema>

export const texts: ReadonlyArray<Text> = z.array(TextSchema).parse(textsData)

export const textBySlug = byKey(texts, 'slug', 'text.slug')

// Texts shown in nav / home TOC / sitemap (everything not flagged hidden).
export const visibleTexts: ReadonlyArray<Text> = texts.filter((t) => !t.hidden)
