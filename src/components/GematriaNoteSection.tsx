// A number-keyed 'note' source: a source label and its prose entry for the
// current number (no Hebrew headword). Paul Case's dictionaries render this way,
// above the word-keyed sources. Mirrors the label + prose treatment of the
// word sections so every source reads consistently.
export function GematriaNoteSection({
  label,
  text,
}: {
  label: string
  text: string
}) {
  return (
    <section>
      <div className="text-xs font-semibold tracking-wide text-zinc-900 uppercase dark:text-white">
        {label}
      </div>
      <p className="mt-1 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
        {text}
      </p>
    </section>
  )
}
