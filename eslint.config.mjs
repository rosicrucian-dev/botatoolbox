import nextVitals from 'eslint-config-next/core-web-vitals'
import { defineConfig, globalIgnores } from 'eslint/config'

const eslintConfig = defineConfig([
  ...nextVitals,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
  {
    // All internal navigation must go through the locale-aware wrappers
    // in components/LocaleLink.tsx (Link, PlainLink, useLocaleRouter,
    // useLocaleTransitionRouter) so /de/ pages link within /de/. Raw
    // next/link and the next-view-transitions Link would drop the locale
    // prefix. LocaleLink itself is the sole importer.
    files: ['src/**/*.{ts,tsx}'],
    // catalyst/link.tsx only takes the LinkProps *type* from next/link.
    ignores: ['src/components/LocaleLink.tsx', 'src/components/catalyst/link.tsx'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'next/link',
              message:
                'Use Link/PlainLink from @/components/LocaleLink so hrefs stay locale-aware.',
            },
            {
              name: 'next-view-transitions',
              importNames: ['Link', 'useTransitionRouter'],
              message:
                'Use Link/useLocaleTransitionRouter from @/components/LocaleLink so hrefs stay locale-aware.',
            },
          ],
        },
      ],
    },
  },
])

export default eslintConfig
