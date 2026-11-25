// What a search engine is told about each page, checked from the source
// so a mistake fails here in seconds rather than in Search Console weeks
// later (25 November 2026). Three rules:
//
//   1. Every docs page that should be indexed declares its canonical URL
//      (`canonicalFor` in src/lib/nav.ts, which `localizedMetadata` calls).
//   2. A redirect stub (`MovedTo`) points at a real page, never at another
//      stub.
//   3. The sitemap lists the address the export serves, with its trailing
//      slash, so no entry is a redirect.
//
//   npm test

import assert from 'node:assert/strict'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { test } from 'node:test'

import sitemap from '../src/app/sitemap.ts'

const docsDir = join(process.cwd(), 'src/app/[locale]/(docs)')

// The dev-only private route is copied into the tree by `npm run dev`
// (scripts/private-mount.mjs) and is never built, so it is not a page of
// the site.
function pages(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      return full === join(docsDir, 'private') ? [] : pages(full)
    }
    return entry.name === 'page.tsx' ? [full] : []
  })
}

const all = pages(docsDir).map((file) => ({
  route: '/' + relative(docsDir, join(file, '..')),
  source: readFileSync(file, 'utf8'),
}))

// A stub is a page that does nothing but redirect: it renders `MovedTo`
// and declares no canonical of its own.
const isStub = (source: string) =>
  source.includes('<MovedTo') &&
  !/canonicalFor\(|localizedMetadata\(/.test(source)

test('every indexable docs page declares a canonical URL', () => {
  const missing = all
    .filter(({ source }) => !isStub(source))
    .filter(
      ({ source }) =>
        !/canonicalFor\(|localizedMetadata\(|canonical:/.test(source),
    )
    .map(({ route }) => route)
  assert.deepEqual(
    missing,
    [],
    'these pages have no canonical: give generateMetadata `alternates: canonicalFor(locale, path)`, or use localizedMetadata(title, path)',
  )
})

test('a page that names its own path names the route it sits at', () => {
  const wrong = all.flatMap(({ route, source }) => {
    const m = source.match(/localizedMetadata\(\s*'[^']*',\s*'([^']*)',?\s*\)/)
    return m && m[1] !== route ? [`${route} declares ${m[1]}`] : []
  })
  assert.deepEqual(wrong, [])
})

test('no redirect stub points at another stub', () => {
  const stubs = new Set(
    all.filter(({ source }) => isStub(source)).map(({ route }) => route),
  )
  assert.ok(stubs.size > 0, 'found no stubs: has the MovedTo marker changed?')
  const chained = all
    .filter(({ source }) => isStub(source))
    .flatMap(({ route, source }) =>
      // Only literal targets; a `to={`…${slug}`}` names a detail page,
      // which is covered by its own route being a page.
      [...source.matchAll(/\bto="([^"]+)"/g)]
        .map((m) => m[1])
        .filter((to) => stubs.has(to))
        .map((to) => `${route} -> ${to}`),
    )
  assert.deepEqual(chained, [], 'point each stub at the final address')
})

test('every stub target with a literal address is a page that exists', () => {
  const dead = all
    .filter(({ source }) => isStub(source))
    .flatMap(({ route, source }) =>
      [...source.matchAll(/\bto="([^"]+)"/g)]
        .map((m) => m[1])
        .filter((to) => !existsSync(join(docsDir, to, 'page.tsx')))
        .map((to) => `${route} -> ${to}`),
    )
  assert.deepEqual(dead, [])
})

test('the sitemap lists addresses with their trailing slash, once each', () => {
  const urls = sitemap().map((entry) => entry.url)
  assert.ok(urls.length > 100, 'the sitemap looks empty')
  assert.deepEqual(
    urls.filter((url) => !url.endsWith('/')),
    [],
  )
  assert.equal(new Set(urls).size, urls.length, 'duplicate sitemap entries')
})
