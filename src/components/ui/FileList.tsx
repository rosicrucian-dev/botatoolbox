import { Link } from '@/components/locale/LocaleLink'
import { type FileEntry } from '@/content/data'

const itemClass =
  '-mx-2 block rounded-sm px-2 py-4 text-zinc-900 transition hover:bg-zinc-50 dark:text-zinc-100 dark:hover:bg-zinc-800/50'

// The rows of a files index: /files draws one of these per section and
// /archive one per kind of file. Not a `DataList`, because a row is not
// always a page of this site — a `direct` entry is the file itself, on
// the CDN. The rest open their viewer, which only /files has; every
// Archive row is `direct` (an integrity check holds it to that).
export function FileList({ files }: { files: ReadonlyArray<FileEntry> }) {
  return (
    <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
      {files.map((f) => (
        <li key={f.slug}>
          {f.direct ? (
            // No `download` attr: navigate to the file so the browser
            // shows the PDF or the image itself. The user can still save
            // it from there if they want.
            <a href={encodeURI(f.src)} className={itemClass}>
              {f.name}
            </a>
          ) : (
            <Link href={`/files/${f.slug}`} className={itemClass}>
              {f.name}
            </Link>
          )}
        </li>
      ))}
    </ul>
  )
}
