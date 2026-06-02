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
  // Strict mode is a dev-only diagnostic that double-mounts components.
  // Disabled because iOS Safari can't survive the double-mount of a
  // WebGL canvas inside the position-fixed `/cube-of-space/expand/`
  // page (the second mount inherits a lost GL context). Production
  // builds never run strict mode regardless of this setting.
  reactStrictMode: false,
  output: 'export',
  // Lets verification builds write to a separate directory so they
  // don't clobber a running dev server's .next/. Defaults to .next as
  // usual; `verify:build` script sets this to .next-verify.
  distDir: process.env.NEXT_DIST_DIR ?? '.next',
  images: { unoptimized: true },
  trailingSlash: true,
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'mdx'],
  // Dev-only: allow phone-on-LAN and cloudflared-tunnel connections to
  // /_next/* (HMR websocket, source maps, etc.). Next 16 blocks these
  // as cross-origin by default. No effect on the static `next build`
  // export.
  allowedDevOrigins: ['192.168.1.159', '*.trycloudflare.com'],
  webpack(config) {
    config.module.rules.push({
      resourceQuery: /^\?raw$/,
      type: 'asset/source',
    })
    return config
  },
}

export default withSearch(withMDX(nextConfig))
