// Hardcoded list of downloadable files shown under /files.
// Each entry has a viewer route at /files/<slug>. Add new entries here.

export interface FileDownload {
  label: string
  src: string
}

export interface FileEntry {
  slug: string
  name: string
  // Image shown in the viewer. For PDFs this is a separate preview image,
  // since an <img> can't render a PDF.
  src: string
  description?: string
  // When present, the viewer shows one button per download instead of a
  // single Download of `src` (e.g. A4 + Letter variants of a print).
  downloads?: ReadonlyArray<FileDownload>
}

export const files: ReadonlyArray<FileEntry> = [
  {
    slug: 'cube-of-space',
    name: 'Printable Cube of Space PDF',
    src: '/files/cube-of-space-net-preview.jpg',
    description: '',
    downloads: [
      { label: 'Download A4', src: '/files/cube-of-space-net-a4.pdf' },
      { label: 'Download US Letter', src: '/files/cube-of-space-net-letter.pdf' },
    ],
  },
  {
    slug: 'wallpaper',
    name: 'Wallpaper',
    src: '/files/wallpaper.jpg',
  },
]

export const fileBySlug = Object.fromEntries(
  files.map((f) => [f.slug, f]),
) as Record<string, FileEntry>
