// Catalyst's Link, wired to the Next.js router (per Catalyst's client-router
// integration note). Used by Catalyst components that render links — e.g. the
// whole-row link in <Table>. Headless.DataInteractive forwards the data-* state
// attributes Catalyst styles against.
import * as Headless from '@headlessui/react'
import { Link as NextLink } from 'next-view-transitions'
import { type LinkProps } from 'next/link'
import React, { forwardRef } from 'react'

export const Link = forwardRef(function Link(
  props: LinkProps & React.ComponentPropsWithoutRef<'a'>,
  ref: React.ForwardedRef<HTMLAnchorElement>,
) {
  return (
    <Headless.DataInteractive>
      <NextLink {...props} ref={ref} />
    </Headless.DataInteractive>
  )
})
