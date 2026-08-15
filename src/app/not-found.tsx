// Global 404 boundary. The root layout is a pass-through (the real
// document lives under [locale]/), so this page renders its own
// <html>/<body> — same trick as global-error.tsx. It deliberately
// avoids the app chrome and client providers; dark mode needs nothing
// here since the dark: variant is a pure prefers-color-scheme query.
export default function NotFound() {
  return (
    <html lang="en" className="h-full">
      <body className="flex min-h-full bg-white antialiased dark:bg-zinc-900">
        <div className="mx-auto flex h-full max-w-xl flex-col items-center justify-center py-16 text-center">
          <p className="text-sm font-semibold text-zinc-900 dark:text-white">
            404
          </p>
          <h1 className="mt-2 text-2xl font-bold text-zinc-900 dark:text-white">
            Page not found
          </h1>
          <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
            Sorry, we couldn’t find the page you’re looking for.
          </p>
          {/* Plain anchor on purpose: this boundary renders outside the
              app providers, so next/link's client machinery isn't worth
              pulling in for a full-page hop home. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a
            href="/"
            className="mt-8 rounded-lg bg-zinc-900 px-3.5 py-2 text-sm font-semibold text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Back to home
          </a>
        </div>
      </body>
    </html>
  )
}
