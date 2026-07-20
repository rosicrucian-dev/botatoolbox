'use client'

// Renders a transcript body and, when the URL carries a search term
// (#q=…, set when arriving from the recordings search), highlights every
// occurrence and scrolls the first into view. Highlighting is done on the
// live DOM after render — the body is trusted, build-time HTML from our own
// markdown, so wrapping matched text nodes in <mark> is safe.

import { useEffect, useRef } from 'react'

import { Prose } from '@/components/Prose'

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function TranscriptBody({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = ref.current
    if (!container) return
    const params = new URLSearchParams(window.location.hash.slice(1))
    const q = params.get('q')?.trim()
    if (!q) return
    const tokens = q
      .toLowerCase()
      .split(/\s+/)
      .filter((tok) => tok.length > 1)
    if (tokens.length === 0) return

    const re = new RegExp(`(${tokens.map(escapeRegExp).join('|')})`, 'gi')
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT)
    const textNodes: Text[] = []
    let node: Node | null
    while ((node = walker.nextNode())) textNodes.push(node as Text)

    let firstMark: HTMLElement | null = null
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
        if (!firstMark) firstMark = mark
        frag.appendChild(mark)
        last = m.index + m[0].length
      }
      if (last < text.length) {
        frag.appendChild(document.createTextNode(text.slice(last)))
      }
      textNode.parentNode?.replaceChild(frag, textNode)
    }
    firstMark?.scrollIntoView({ block: 'center' })
  }, [html])

  return (
    <Prose>
      <div ref={ref} dangerouslySetInnerHTML={{ __html: html }} />
    </Prose>
  )
}
