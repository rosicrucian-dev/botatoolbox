/** @type {import('next').NextConfig} */
const nextConfig = {
  // Strict mode is a dev-only diagnostic that double-mounts components.
  // Disabled because iOS Safari can't survive the double-mount of a
  // WebGL canvas inside the position-fixed `/cube-of-space/expand/`
  // page (the second mount inherits a lost GL context). Production
  // builds never run strict mode regardless of this setting.
  reactStrictMode: false,
  // Static export for builds only. In dev, `output: 'export'` insists
  // every dynamic param come from a page-level generateStaticParams —
  // it doesn't collect the [locale] layout's params like the build does
  // — so / (rewritten to /en/) 500s. Plain dev mode renders params on
  // demand (the [locale] layout's dynamicParams=false still 404s /fr/),
  // and the dev-only locale rewrite below stops warning, too. Build
  // output is unaffected: `next build` always runs with output: export.
  output: process.env.NODE_ENV === 'development' ? undefined : 'export',
  // Lets verification builds write to a separate directory so they
  // don't clobber a running dev server's .next/. Defaults to .next as
  // usual; `verify:build` script sets this to .next-verify.
  distDir: process.env.NEXT_DIST_DIR ?? '.next',
  images: { unoptimized: true },
  trailingSlash: true,
  // Dev-only: allow phone-on-LAN and cloudflared-tunnel connections to
  // /_next/* (HMR websocket, source maps, etc.). Next 16 blocks these
  // as cross-origin by default. No effect on the static `next build`
  // export.
  allowedDevOrigins: ['192.168.1.159', '*.trycloudflare.com'],
  // Dev-only: serve unprefixed English URLs from the /en/ tree so dev
  // matches the deployed URL shape (scripts/hoist-en.ts moves out/en/*
  // to the export root after `next build`). A *fallback* rewrite runs
  // only when no filesystem route matched, so /de/... and /_next/...
  // pass through untouched. Keyed off NODE_ENV because `output:
  // 'export'` doesn't support rewrites at build time — the key must not
  // exist there.
  ...(process.env.NODE_ENV === 'development' && {
    async rewrites() {
      return { fallback: [{ source: '/:path*', destination: '/en/:path*' }] }
    },
  }),
  webpack(config) {
    // Next's built-in asset rule claims .svg imports (emitting an
    // { src, width, ... } module). Carve `?raw` out of it so the raw
    // rule below can serve SVG source strings (the inline cube mark in
    // CubeMark.tsx). Without this, `cube.svg?raw` stringifies Next's
    // generated module instead of the file.
    const svgAssetRule = config.module.rules.find((rule) =>
      rule?.test?.test?.('.svg'),
    )
    if (svgAssetRule) {
      svgAssetRule.resourceQuery = {
        not: [...(svgAssetRule.resourceQuery?.not ?? []), /^\?raw$/],
      }
    }

    // `import x from './file.md?raw'` — raw-string imports for the
    // bespoke markdown parsers (e.g. the Trestleboard statements) and
    // the inline SVG mark.
    config.module.rules.push({
      resourceQuery: /^\?raw$/,
      type: 'asset/source',
    })
    return config
  },
}

export default nextConfig
