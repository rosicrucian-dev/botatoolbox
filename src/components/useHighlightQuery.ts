import { useEffect, type RefObject } from 'react'

import { tokenize } from '@/lib/collection-search'

// When the URL carries a search term (#q=…, set when arriving from a collection
// search), highlight the match within `ref` and scroll the first into view.
//
// Phrase-first: the query's words in order, with any punctuation/space between,
// are highlighted as ONE span — so "Builders of the Adytum" marks the whole
// phrase, not every scattered "of"/"the". If the phrase isn't on the page (a
// loose match), it falls back to the distinctive CONTENT words only (stopwords
// dropped), so common words never get marked on their own.
//
// The marking is done on the live DOM after render — content is trusted,
// build-time output from our own markdown/parsers, so wrapping matched text
// nodes in <mark> is safe. Shared by TranscriptBody, TranscriptPlayer, and the
// Book of Tokens chapter page. `dep` re-runs the pass when the rendered content
// identity changes (the HTML string, a chapter slug…).

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// Wrap every match of `re` inside `container` in <mark>; return whether anything
// matched, and scroll the first match into view.
function markMatches(container: HTMLElement, re: RegExp): boolean {
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT)
  const textNodes: Text[] = []
  let node: Node | null
  while ((node = walker.nextNode())) textNodes.push(node as Text)

  let first: HTMLElement | null = null
  for (const textNode of textNodes) {
    const text = textNode.nodeValue ?? ''
    re.lastIndex = 0
    if (!re.test(text)) continue
    re.lastIndex = 0
    const frag = document.createDocumentFragment()
    let last = 0
    let m: RegExpExecArray | null
    while ((m = re.exec(text))) {
      if (m.index > last) {
        frag.appendChild(document.createTextNode(text.slice(last, m.index)))
      }
      const mark = document.createElement('mark')
      mark.className =
        'rounded-sm bg-amber-200/70 text-inherit dark:bg-amber-400/30'
      mark.textContent = m[0]
      if (!first) first = mark
      frag.appendChild(mark)
      last = m.index + m[0].length
      if (re.lastIndex === m.index) re.lastIndex++ // guard against zero-width
    }
    if (last < text.length) {
      frag.appendChild(document.createTextNode(text.slice(last)))
    }
    textNode.parentNode?.replaceChild(frag, textNode)
  }
  first?.scrollIntoView({ block: 'center' })
  return first !== null
}

export function useHighlightQuery(
  ref: RefObject<HTMLElement | null>,
  dep?: unknown,
): void {
  useEffect(() => {
    const container = ref.current
    if (!container) return
    const q = new URLSearchParams(window.location.hash.slice(1)).get('q')?.trim()
    if (!q) return

    // Phrase: the query's word runs in order, joined by non-word gaps.
    const words = q.match(/[\p{L}\p{N}']+/gu) ?? []
    if (words.length === 0) return
    const phrase = new RegExp(
      '\\b' + words.map(escapeRegExp).join('\\W+') + '\\b',
      'giu',
    )
    if (markMatches(container, phrase)) return

    // Fallback: distinctive content words only (stopwords dropped).
    const content = tokenize(q)
    if (content.length === 0) return
    const wordsRe = new RegExp(
      '\\b(' + content.map(escapeRegExp).join('|') + ')\\b',
      'giu',
    )
    markMatches(container, wordsRe)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dep])
}
