import { cardByLetter, cardImage } from '@/content/data/tarot'

interface LetterMeta {
  glyph: string
  sofit: string | null
}

export const letters: Record<string, LetterMeta> = {
  Aleph: { glyph: 'א', sofit: null },
  Beth: { glyph: 'ב', sofit: null },
  Gimel: { glyph: 'ג', sofit: null },
  Daleth: { glyph: 'ד', sofit: null },
  Heh: { glyph: 'ה', sofit: null },
  Vav: { glyph: 'ו', sofit: null },
  Zain: { glyph: 'ז', sofit: null },
  Cheth: { glyph: 'ח', sofit: null },
  Teth: { glyph: 'ט', sofit: null },
  Yod: { glyph: 'י', sofit: null },
  Kaph: { glyph: 'כ', sofit: 'ך' },
  Lamed: { glyph: 'ל', sofit: null },
  Mem: { glyph: 'מ', sofit: 'ם' },
  Nun: { glyph: 'נ', sofit: 'ן' },
  Samekh: { glyph: 'ס', sofit: null },
  Ayin: { glyph: 'ע', sofit: null },
  Peh: { glyph: 'פ', sofit: 'ף' },
  Tzaddi: { glyph: 'צ', sofit: 'ץ' },
  Qoph: { glyph: 'ק', sofit: null },
  Resh: { glyph: 'ר', sofit: null },
  Shin: { glyph: 'ש', sofit: null },
  Tav: { glyph: 'ת', sofit: null },
}

// Looks up a Hebrew letter's glyph + sofit. Returns a fallback for
// unknown letter names instead of undefined so callers don't need to
// cast. All data files now store letter names without diacritics, so a
// direct lookup suffices.
export function getLetterMeta(name: string): LetterMeta {
  return letters[name] ?? { glyph: '?', sofit: null }
}

export interface RawWord {
  slug: string
  name: string
  english?: string
  meaning?: string
  // Letter counts for each Hebrew word, when the entry is a multi-word
  // name like "IHVH TzBAVTh". Sum must equal letters.length. Single-word
  // entries omit this field. Used to render pronunciation with a space
  // between words and dashes within a word: `yod-heh-wah-heh tsah-bah-…`.
  wordSizes?: Array<number>
  letters: Array<{ letter: string; pronunciation: string }>
}

export interface ExpandedLetter {
  label: string
  pronunciation: string
  glyph: string
  note?: string
  color?: string
  cardSlug?: string
  cardName?: string
  cardNum?: number
  cardImage?: string
}

export interface ExpandedWord {
  slug: string
  name: string
  english?: string
  meaning?: string
  wordSizes?: Array<number>
  letters: Array<ExpandedLetter>
}

// Builds a human-readable pronunciation: dashes within each word, a space
// between words. Single-word entries (no wordSizes) get one dash-joined
// string. Multi-word entries get `yod-heh-wah-heh tsah-bah-ah-oo-oot`-style
// output, which lets the browser break lines at the natural word gaps.
export function formatPronunciation(
  letters: Array<{ pronunciation: string }>,
  wordSizes?: Array<number>,
): string {
  if (!wordSizes || wordSizes.length === 0) {
    return letters.map((l) => l.pronunciation).join('-')
  }
  const words: Array<string> = []
  let i = 0
  for (const size of wordSizes) {
    words.push(
      letters
        .slice(i, i + size)
        .map((l) => l.pronunciation)
        .join('-'),
    )
    i += size
  }
  return words.join(' ')
}

export function expandWord(word: RawWord): ExpandedWord {
  const expanded: Array<ExpandedLetter> = word.letters.map((l, i) => {
    const isLast = i === word.letters.length - 1
    const meta = letters[l.letter] ?? { glyph: '?', sofit: null }
    const card = cardByLetter[l.letter]
    return {
      label: l.letter,
      pronunciation: l.pronunciation,
      glyph: isLast && meta.sofit ? meta.sofit : meta.glyph,
      note: card?.note,
      color: card?.color,
      cardSlug: card?.slug,
      cardName: card?.name,
      cardNum: card?.num,
      cardImage: card ? cardImage(card) : undefined,
    }
  })
  return { ...word, letters: expanded }
}
