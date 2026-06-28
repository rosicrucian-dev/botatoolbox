// Source credit for the gematria definitions, shown beneath the word tables on
// the Calculator and Dictionary. Crowley's Sepher Sephiroth is public domain;
// Strong's (via Open Scriptures) is CC BY-SA, so crediting it is a license
// requirement, not just courtesy. Kept deliberately subtle.
export function GematriaSources() {
  return (
    <p className="border-t border-zinc-100 pt-4 text-xs leading-relaxed text-zinc-400 dark:border-zinc-800/60 dark:text-zinc-500">
      Definitions from Aleister Crowley&rsquo;s <cite>Sepher Sephiroth</cite>{' '}
      (public domain) and James Strong&rsquo;s <cite>Hebrew Dictionary</cite>, via{' '}
      <a
        href="https://github.com/openscriptures/strongs"
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2 transition hover:text-zinc-600 dark:hover:text-zinc-300"
      >
        Open Scriptures
      </a>{' '}
      (
      <a
        href="https://creativecommons.org/licenses/by-sa/4.0/"
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2 transition hover:text-zinc-600 dark:hover:text-zinc-300"
      >
        CC&nbsp;BY-SA
      </a>
      ).
    </p>
  )
}
