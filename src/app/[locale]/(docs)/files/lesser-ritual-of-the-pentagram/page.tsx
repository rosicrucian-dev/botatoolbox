import { MovedTo } from '@/components/nav/MovedTo'

// This image had a viewer page at this address until 25 November 2026.
// It is a direct link in the Archive section of /files now, which opens
// the image itself, so the stub sends a reader to that list.

export default function LesserRitualOfThePentagramRedirect() {
  return (
    <MovedTo
      to="/files"
      what="The Lesser Ritual of the Pentagram page"
      verb="is gone; the image is listed on"
      label="Files"
    />
  )
}
