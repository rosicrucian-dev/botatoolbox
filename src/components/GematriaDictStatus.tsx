// Shared pending/error line for the fetched gematria dictionary, so the
// calculator and the dictionary present the same states: "Looking up…"
// while the asset loads, and an explicit failure message with a working
// retry when it doesn't.

export function GematriaDictStatus({
  status,
  retry,
}: {
  status: 'loading' | 'error'
  retry: () => void
}) {
  return (
    <p className="py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
      {status === 'loading' ? (
        <>Looking up&hellip;</>
      ) : (
        <>
          The dictionary failed to load.{' '}
          <button
            type="button"
            onClick={retry}
            className="font-medium text-zinc-900 underline underline-offset-2 dark:text-zinc-100"
          >
            Try again
          </button>
        </>
      )}
    </p>
  )
}
