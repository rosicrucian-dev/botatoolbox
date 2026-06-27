import fs from 'node:fs'

const text = fs.readFileSync('/tmp/oracle.txt', 'utf8')
const lines = text.split('\n')

const NUMS = ['ACE','TWO','THREE','FOUR','FIVE','SIX','SEVEN','EIGHT','NINE','TEN']
const SUITS = ['WANDS','CUPS','SWORDS','PENTACLES']
const numToDataNum: Record<string,string> = {ACE:'Ace',TWO:'2',THREE:'3',FOUR:'4',FIVE:'5',SIX:'6',SEVEN:'7',EIGHT:'8',NINE:'9',TEN:'10'}
const suitToTitle: Record<string,string> = {WANDS:'Wands',CUPS:'Cups',SWORDS:'Swords',PENTACLES:'Pentacles'}

type Header = { idx: number, num: string, suit: string }
const cardRe = new RegExp('^\\s*THE\\s+(' + NUMS.join('|') + ')\\s+OF\\s+(' + SUITS.join('|') + ')\\s*$', 'i')
const headers: Header[] = []
const seen = new Set<string>()
lines.forEach((line, idx) => {
  const m = cardRe.exec(line.trim())
  if (!m) return
  const k = m[1].toUpperCase() + '_' + m[2].toUpperCase()
  if (seen.has(k)) return
  seen.add(k)
  headers.push({ idx, num: m[1].toUpperCase(), suit: m[2].toUpperCase() })
})

// Sort by line idx so we can find KEY DIVINATORY MEANINGS that follows each header
headers.sort((a,b) => a.idx - b.idx)

interface Entry { num: string, suit: string, raw: string }
const entries: Entry[] = []

for (let i = 0; i < headers.length; i++) {
  const h = headers[i]
  const nextIdx = i + 1 < headers.length ? headers[i+1].idx : lines.length
  
  // Find KEY DIVINATORY MEANINGS within this section
  let kdmStart = -1
  for (let j = h.idx; j < nextIdx; j++) {
    // Tolerate OCR variants like "KEY DIY INA TORY MEANINGS", "KEY DIVINA TORY MEANINGS", "KEY DIVINATOR Y MEANINGS"
    if (/KEY\s+D[IY][VY]?\s*[IV]?NA\s*TOR\s*Y?\s+MEANIN\s*GS/i.test(lines[j])) {
      kdmStart = j + 1
      break
    }
  }
  if (kdmStart === -1) continue
  
  // Collect lines until KEY WORD heading (case-insensitive)
  const collected: string[] = []
  for (let j = kdmStart; j < nextIdx; j++) {
    if (/^\s*KEY\s+WORD/i.test(lines[j])) break
    collected.push(lines[j])
  }
  
  // Join, normalize whitespace, drop empty
  let raw = collected
    .join(' ')
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:])/g, '$1')
    .trim()

  // OCR cleanup. The source is a 60s scan; the most common artifacts:
  //   - tildes scattered through words (natu~al → natural)
  //   - broken words at end of line ("in conse- quence" → "in consequence")
  //   - 1 in place of i (1n1t1at10n → initiation) and 0 in place of o
  //   - "lll" mistaken for "Ill"
  //   - page footers like "(4) THE ORACLE OF TAROT: 8" appearing mid-paragraph
  raw = raw
    // Strip page-footer noise that leaked into the middle of a paragraph.
    .replace(/\(\s*\d+\s*\)\s*THE\s+ORACLE\s+OF\s+TAROT[\s:]*\d*/gi, ' ')
    // Tildes in body text are universally OCR artifacts here.
    .replace(/~/g, '')
    // Join hyphenated line-breaks: "conse- quence" → "consequence".
    // Preserve known prefixes that legitimately end in a hyphen.
    .replace(/(\w+)-\s+(\w+)/g, (m, a, b) => {
      const known = new Set([
        'well', 'ill', 'self', 'over', 'sub', 'non', 'pre', 're',
        'ultra', 'co', 'anti', 'semi', 'inter', 'cross',
      ])
      if (known.has(a.toLowerCase())) return `${a}-${b}`
      return `${a}${b}`
    })
    // First normalize OCR-mangled "Dignified": lots of variants seen,
    // "Dignifled", "Dignifie d", "Digni fied" (broken word splits).
    .replace(/\b[Dd]ign[ei]f[il]?[ee]?d/g, 'Dignified')
    .replace(/\bDigni\s+fied/g, 'Dignified')
    // Normalize the many OCR-mangled forms of "Ill-Dignified" so the
    // splitter regex below catches them: lllDignified, ruDignified,
    // Dl-Dignified, Til-Dignified, n1-Dignified, "D 1Dignified", etc.
    .replace(/\b(?:lll|ru|Til|n1|Dl|D\s*1|Tl|Ti?l?l?|Ill|ill)[\s.\-]*Dignified/gi, 'Ill-Dignified')
    // Collapse double spaces produced by the cleanups.
    .replace(/\s+/g, ' ')
    .trim()
  
  entries.push({ num: h.num, suit: h.suit, raw })
}

// Parse intro / well-dignified / ill-dignified
function parseParts(raw: string): { intro: string, wellDignified: string, illDignified: string } {
  // OCR variations to tolerate:
  //   "Well Dignified", "Well-Dignified", "Well- Dignified", "Well-dignified"
  //   "Ill Dignified", "Ill-Dignified", "lll Dignified" (lowercase L mistaken for I),
  //   "ru- Dignified" (very garbled), "Til Dignified", "n1 Dignified", "ill-Dignified"
  // I'll grep for the most common patterns and capture everything that follows.
  // Colon is required — these are section labels in the source, and
  // the word "ill-dignified" also appears in exposition (e.g. the Ace
  // of Swords intro). Requiring the colon avoids the mid-sentence
  // false-positive.
  const wellRe = /\bWell[\s-]+[Dd]ignified\s*[:.]\s*/
  const illRe = /\bIll-Dignified\s*[:.]\s*/

  const wellMatch = wellRe.exec(raw)
  const illMatch = illRe.exec(raw)

  let intro = raw
  let wellDignified = ''
  let illDignified = ''

  if (wellMatch && illMatch) {
    intro = raw.slice(0, wellMatch.index).trim()
    wellDignified = raw.slice(wellMatch.index + wellMatch[0].length, illMatch.index).trim()
    illDignified = raw.slice(illMatch.index + illMatch[0].length).trim()
  } else if (wellMatch && !illMatch) {
    intro = raw.slice(0, wellMatch.index).trim()
    wellDignified = raw.slice(wellMatch.index + wellMatch[0].length).trim()
  } else if (!wellMatch && illMatch) {
    intro = raw.slice(0, illMatch.index).trim()
    illDignified = raw.slice(illMatch.index + illMatch[0].length).trim()
  }
  // Final cleanups per part: strip leading single-char OCR margin marks
  // ("I The...", "r The...") and trailing whitespace + comma/colon
  // (which come from split-boundary residue like "...meanings:" right
  // before a "Well Dignified:" label).
  const tidy = (s: string) =>
    s
      .replace(/^[a-zA-Z]\s+(?=[A-Z])/, '') // "I The..." → "The..."
      .replace(/[\s,:]+$/, '')
      .replace(/\s+/g, ' ')
      .trim()
  return {
    intro: tidy(intro),
    wellDignified: tidy(wellDignified),
    illDignified: tidy(illDignified),
  }
}

const out = entries.map(e => {
  const parts = parseParts(e.raw)
  return {
    num: numToDataNum[e.num],
    suit: suitToTitle[e.suit],
    ...parts,
  }
})
console.log(JSON.stringify(out, null, 2))
