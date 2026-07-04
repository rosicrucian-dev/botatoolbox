import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { parseRitual } from '@/content/data/rituals'
import { LrpPlayer } from './LrpPlayer'

// Server wrapper: parse the ritual markdown at build and hand the plain
// section data across the RSC boundary. The choreography (slides, angel
// visualizations, chant timing) lives in the client component.

export default function LesserPentagramPlayPage() {
  const md = readFileSync(
    join(process.cwd(), 'content/rituals', 'lrp.md'),
    'utf8',
  )
  return <LrpPlayer sections={parseRitual(md)} />
}
