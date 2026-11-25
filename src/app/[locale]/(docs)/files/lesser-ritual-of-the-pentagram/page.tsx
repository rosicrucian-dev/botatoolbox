import { MovedTo } from '@/components/nav/MovedTo'

// THE HISTORICAL FILES ARE THE ARCHIVE (25 November 2026), a row of the
// Library with its own index at /archive. This image had a viewer page
// at this address; the Archive links straight to the image instead, so
// what is left to send a reader to is the Archive itself.

export default function LesserRitualOfThePentagramRedirect() {
  return (
    <MovedTo
      to="/archive"
      what="The Lesser Ritual of the Pentagram"
      label="the Archive"
    />
  )
}
