import { type Metadata } from 'next'

import { Prose } from '@/components/Prose'

export const metadata: Metadata = {
  title: 'About',
}

export default function About() {
  return (
    <article className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight dark:text-white">
        About
      </h1>
      <Prose>
        <p>
          BOTA Toolbox is a project of{' '}
          <a href="https://github.com/rosicrucian-dev">Rosicrucian Developers</a>
          . For questions, contact{' '}
          <a href="mailto:jonathan@rosicrucian.dev">Jonathan</a>. You can open an
          issue or help contribute on{' '}
          <a href="https://github.com/rosicrucian-dev/botatoolbox">GitHub</a>.
        </p>
        <p>
          The material used for this website is gathered using publicly
          available information from <a href="https://bota.org">Builders of the
          Adytum</a>, <a href="https://lvx.org">Fraternity of the Hidden Light</a>,
          and other sources. Colors were specifically chosen using FLO&rsquo;s
          sequence of color cards from{' '}
          <a href="https://coloraid.com">Color Aid</a>.
        </p>
        <p>
          Join the{' '}
          <a href="https://discord.gg/hKWWH6ukdV">Symposium of the Rose</a> on
          Discord to discuss this and other Rosicrucian related projects.
        </p>
      </Prose>
    </article>
  )
}
