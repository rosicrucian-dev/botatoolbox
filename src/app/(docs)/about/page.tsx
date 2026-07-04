import { type Metadata } from 'next'

import { PageHeading } from '@/components/PageHeading'
import { Prose } from '@/components/Prose'

export const metadata: Metadata = {
  title: 'About',
}

export default function About() {
  return (
    <article className="space-y-6">
      <PageHeading>About</PageHeading>
      <Prose>
        <p>
          BOTA Toolbox is a project of{' '}
          <a href="https://github.com/rosicrucian-dev">
            Rosicrucian Developers
          </a>
          . For questions, contact{' '}
          <a href="mailto:jonathan@rosicrucian.dev">Jonathan</a>. You can open
          an issue or help contribute on{' '}
          <a href="https://github.com/rosicrucian-dev/botatoolbox">GitHub</a>.
        </p>
        {/* <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          For an optimal experience, exclude this website from any dark mode extensions in your browser so it doesn&apos;t interfere with the colors used for meditation.
        </p> */}
        <p>
          The material used for this website is gathered using publicly
          available information from{' '}
          <a href="https://bota.org">Builders of the Adytum</a>,{' '}
          <a href="https://lvx.org">Fraternity of the Hidden Light</a>, and
          other sources. The minor arcana images are colored and provided with
          permission by <a href="https://joshyates.me/">Josh Yates</a>.
        </p>
        <p>
          Join the{' '}
          <a href="https://discord.gg/hKWWH6ukdV">Symposium of the Rose</a> on
          Discord to discuss this and other Rosicrucian related projects.
        </p>
        <p>
          To support this project, you can keep Jonathan caffeinated with{' '}
          <a href="https://buymeacoffee.com/rosicruciandev">Buy Me a Coffee</a>.
          I am always looking to improve and expand this website. Thank you!️ 🌹
        </p>
      </Prose>
    </article>
  )
}
