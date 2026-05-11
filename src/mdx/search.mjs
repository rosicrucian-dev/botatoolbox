import { slugifyWithCounter } from '@sindresorhus/slugify'
import glob from 'fast-glob'
import * as fs from 'fs'
import { toString } from 'mdast-util-to-string'
import * as path from 'path'
import { remark } from 'remark'
import remarkMdx from 'remark-mdx'
import { createLoader } from 'simple-functional-loader'
import { filter } from 'unist-util-filter'
import { SKIP, visit } from 'unist-util-visit'
import * as url from 'url'

const __filename = url.fileURLToPath(import.meta.url)
const processor = remark().use(remarkMdx).use(extractSections)
const slugify = slugifyWithCounter()

function isObjectExpression(node) {
  return (
    node.type === 'mdxTextExpression' &&
    node.data?.estree?.body?.[0]?.expression?.type === 'ObjectExpression'
  )
}

function excludeObjectExpressions(tree) {
  return filter(tree, (node) => !isObjectExpression(node))
}

function extractSections() {
  return (tree, { sections }) => {
    slugify.reset()

    visit(tree, (node) => {
      if (node.type === 'heading' || node.type === 'paragraph') {
        let content = toString(excludeObjectExpressions(node))
        if (node.type === 'heading' && node.depth <= 2) {
          let hash = node.depth === 1 ? null : slugify(content)
          sections.push([content, hash, []])
        } else {
          sections.at(-1)?.[2].push(content)
        }
        return SKIP
      }
    })
  }
}

export default function Search(nextConfig = {}) {
  let cache = new Map()

  return Object.assign({}, nextConfig, {
    webpack(config, options) {
      config.module.rules.push({
        test: __filename,
        use: [
          createLoader(function () {
            let appDir = path.resolve('./src/app')
            let dataDir = path.resolve('./src/content')
            let contentDir = path.resolve('./content')
            let contentDataDir = path.resolve('./content/data')
            this.addContextDependency(appDir)
            this.addContextDependency(dataDir)
            this.addContextDependency(contentDir)

            // MDX pages — strip route-group segments like "(docs)/" from
            // the URL so it matches the actual pathname.
            let files = glob.sync('**/*.mdx', { cwd: appDir })
            let mdxData = files.map((file) => {
              let url =
                '/' +
                file
                  .replace(/(^|\/)page\.mdx$/, '')
                  .replace(/\([^)]+\)\//g, '')
              if (url !== '/' && !url.endsWith('/')) url += '/'
              let mdx = fs.readFileSync(path.join(appDir, file), 'utf8')

              let sections = []

              if (cache.get(file)?.[0] === mdx) {
                sections = cache.get(file)[1]
              } else {
                let vfile = { value: mdx, sections }
                processor.runSync(processor.parse(vfile), vfile)
                cache.set(file, [mdx, sections])
              }

              return { url, sections }
            })

            // Static index pages — explicit list because they're TSX, not
            // MDX, so the glob above doesn't pick them up. Title is what
            // the user would search for; the empty content array is fine
            // since titles alone are indexed.
            let staticPages = [
              { url: '/', title: 'BOTA Toolbox' },
              { url: '/tarot/tableau/', title: 'Tableau' },
              { url: '/tarot/major-arcana/', title: 'Major Arcana' },
              { url: '/tarot/minor-arcana/', title: 'Minor Arcana' },
              { url: '/cube-of-space/', title: 'Cube of Space' },
              { url: '/tree-of-life/', title: 'Tree of Life' },
              { url: '/healing/planets/', title: 'Planets' },
              { url: '/healing/signs/', title: 'Signs' },
              {
                url: '/rituals/lrp/',
                title: 'The Lesser Ritual of the Pentagram',
              },
              {
                url: '/texts/pattern-trestleboard/',
                title: 'The Pattern on the Trestleboard',
              },
              { url: '/words-of-power/', title: 'Words of Power' },
            ].map(({ url, title }) => ({
              url,
              sections: [[title, null, []]],
            }))

            // Tarot card detail pages — title is card name, content
            // includes the letter/color/astrology so a query like "Yellow"
            // or "Aleph" surfaces matching cards.
            let cards = JSON.parse(
              fs.readFileSync(path.join(contentDataDir, 'tarot.json'), 'utf8'),
            )
            let cardData = cards.map((c) => ({
              url: `/tarot/${c.slug}/`,
              sections: [
                [
                  c.name,
                  null,
                  [
                    c.letter,
                    c.color,
                    c.astrology,
                    c.alchemy,
                    c.intelligence,
                    c.power,
                    c.human,
                  ].filter(Boolean),
                ],
              ],
            }))

            // Words of Power detail pages — match on Hebrew letter id, the
            // English transliteration ("Eheyeh"), and the meaning string.
            let words = JSON.parse(
              fs.readFileSync(path.join(contentDataDir, 'words.json'), 'utf8'),
            )
            let wordData = words.map((w) => ({
              url: `/words-of-power/${w.slug}/`,
              sections: [
                [
                  w.name,
                  null,
                  [w.english, w.meaning].filter(Boolean),
                ],
              ],
            }))

            // Tree of Life sephirah detail pages.
            let sephiroth = JSON.parse(
              fs.readFileSync(path.join(contentDataDir, 'sephiroth.json'), 'utf8'),
            )
            let sephData = sephiroth.map((s) => ({
              url: `/tree-of-life/${s.slug}/`,
              sections: [[`${s.hebrewName} — ${s.name}`, null, []]],
            }))

            // Astrology sign + planet detail pages. Content includes the
            // Hebrew letter, body part / chakra, element / quality, and
            // rulership slugs so queries like "Mars" surface both Mars
            // (the planet) and Aries / Scorpio (the signs Mars rules).
            let signs = JSON.parse(
              fs.readFileSync(path.join(contentDataDir, 'signs.json'), 'utf8'),
            )
            let signData = signs.map((s) => ({
              url: `/astrology/signs/${s.slug}/`,
              sections: [
                [
                  s.name,
                  null,
                  [
                    s.letter,
                    s.bodyPart,
                    s.element,
                    s.quality,
                    ...(s.rulers ?? []),
                    s.exaltedBy,
                  ].filter(Boolean),
                ],
              ],
            }))

            let planets = JSON.parse(
              fs.readFileSync(path.join(contentDataDir, 'planets.json'), 'utf8'),
            )
            let planetData = planets.map((p) => ({
              url: `/astrology/planets/${p.slug}/`,
              sections: [
                [
                  p.name,
                  null,
                  [
                    p.letter,
                    p.chakra,
                    ...(p.rules ?? []),
                    p.exaltedIn,
                  ].filter(Boolean),
                ],
              ],
            }))

            let data = [
              ...mdxData,
              ...staticPages,
              ...cardData,
              ...wordData,
              ...sephData,
              ...signData,
              ...planetData,
            ]

            // When this file is imported within the application
            // the following module is loaded:
            return `
              import FlexSearch from 'flexsearch'

              let sectionIndex = new FlexSearch.Document({
                tokenize: 'full',
                document: {
                  id: 'url',
                  index: 'content',
                  store: ['title', 'pageTitle'],
                },
                context: {
                  resolution: 9,
                  depth: 2,
                  bidirectional: true
                }
              })

              let data = ${JSON.stringify(data)}

              // Title-only indexing. The composed content arrays (letter,
              // color, astrology rulers, etc.) per entry are kept in the
              // source data above for potential future use, but NOT fed
              // to FlexSearch — including them produced too many
              // tangential hits (e.g. "Saturn" surfacing The World,
              // Capricorn, Libra via cross-reference fields). Searching
              // by title keeps results focused on the thing the user
              // typed.
              for (let { url, sections } of data) {
                for (let [title, hash] of sections) {
                  sectionIndex.add({
                    url: url + (hash ? ('#' + hash) : ''),
                    title,
                    content: title,
                    pageTitle: hash ? sections[0][0] : undefined,
                  })
                }
              }

              export function search(query, options = {}) {
                let result = sectionIndex.search(query, {
                  ...options,
                  enrich: true,
                })
                if (result.length === 0) {
                  return []
                }
                return result[0].result.map((item) => ({
                  url: item.id,
                  title: item.doc.title,
                  pageTitle: item.doc.pageTitle,
                }))
              }
            `
          }),
        ],
      })

      if (typeof nextConfig.webpack === 'function') {
        return nextConfig.webpack(config, options)
      }

      return config
    },
  })
}
