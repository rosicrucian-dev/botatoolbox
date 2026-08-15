// Catalyst's Link, wired to the Next.js router (per Catalyst's client-router
// integration note). Used by Catalyst components that render links — e.g. the
// whole-row link in <Table>. Headless.DataInteractive forwards the data-* state
// attributes Catalyst styles against. Goes through LocaleLink so every
// Catalyst-rendered href (Button, Table rows, Listbox) is locale-aware.
import * as Headless from '@headlessui/react'
import { type LinkProps } from 'next/link'
import React, { forwardRef } from 'react'

import { Link as LocaleLink } from '@/components/LocaleLink'

export const Link = forwardRef(function Link(
  props: LinkProps & React.ComponentPropsWithoutRef<'a'>,
  ref: React.ForwardedRef<HTMLAnchorElement>,
) {
  return (
    <Headless.DataInteractive>
      <LocaleLink {...props} ref={ref} />
    </Headless.DataInteractive>
  )
})
