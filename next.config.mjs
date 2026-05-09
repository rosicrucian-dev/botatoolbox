import nextMDX from '@next/mdx'

import { recmaPlugins } from './src/mdx/recma.mjs'
import { rehypePlugins } from './src/mdx/rehype.mjs'
import { remarkPlugins } from './src/mdx/remark.mjs'
import withSearch from './src/mdx/search.mjs'

const withMDX = nextMDX({
  options: {
    remarkPlugins,
    rehypePlugins,
    recmaPlugins,
  },
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'mdx'],
  outputFileTracingIncludes: {
    '/**/*': ['./src/app/**/*.mdx'],
  },
  // Content .md files are user-editable (rituals, texts) — load them as
  // raw strings so wrappers in src/data/ can parse them. Scoped to the
  // top-level /content/ directory so future MDX usage in routes isn't
  // affected. Wrappers cast the import to string at the call site
  // (@types/mdx ambient-types .md as an MDX component).
  webpack(config) {
    config.module.rules.push({
      test: /\.md$/,
      include: /[\\/]content[\\/]/,
      type: 'asset/source',
    })
    return config
  },
}

export default withSearch(withMDX(nextConfig))
