'use client'

import { useEffect, useRef, useState } from 'react'
import * as Headless from '@headlessui/react'
import clsx from 'clsx'

// Inline autocomplete combobox. Type to filter; click an option to select.
// Adapted from the Tailwind UI catalyst pattern, trimmed to what the quiz
// player needs — no virtualization, no description column.
//
// Optional `trailing` slot renders a button (or any node) flush against
// the right edge of the input, sharing the input's ring and rounded
// corners so the pair reads as a single control.
//
// Generic over the option value type, but options are usually strings.

export interface InlineComboboxProps<T> {
  options: ReadonlyArray<T>
  value: T | null
  onChange: (value: T | null) => void
  displayValue: (value: T | null) => string
  placeholder?: string
  autoFocus?: boolean
  // Optional custom filter. Defaults to case-insensitive substring match
  // on displayValue.
  filter?: (option: T, query: string) => boolean
  trailing?: React.ReactNode
  // Validation state. 'invalid' sets aria-invalid on the input (Tailwind
  // styles it via the `aria-invalid:` modifier). 'valid' sets a
  // data-valid attribute (matched by `data-valid:` — symmetric pattern
  // since ARIA has no "valid" semantic).
  status?: 'idle' | 'valid' | 'invalid'
  id?: string
  'aria-label'?: string
}

export function InlineCombobox<T>({
  options,
  value,
  onChange,
  displayValue,
  placeholder,
  autoFocus,
  filter,
  trailing,
  status = 'idle',
  id,
  'aria-label': ariaLabel,
}: InlineComboboxProps<T>) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Honor `autoFocus` only on fine-pointer (mouse/trackpad) devices.
  // On coarse-pointer / touch devices we skip the focus so the OS
  // keyboard doesn't pop up on mount. Done imperatively because the
  // HTML `autofocus` attribute fires only at first paint, before any
  // matchMedia gating could intercept it.
  useEffect(() => {
    if (!autoFocus) return
    if (window.matchMedia('(pointer: fine)').matches) {
      inputRef.current?.focus()
    }
  }, [autoFocus])

  // Empty query → no dropdown. Require the user to type at least one
  // character before any options surface.
  const filtered =
    query === ''
      ? []
      : options.filter((opt) =>
          filter
            ? filter(opt, query)
            : displayValue(opt).toLowerCase().includes(query.toLowerCase()),
        )

  return (
    <Headless.Combobox
      value={value}
      onChange={onChange}
      onClose={() => setQuery('')}
    >
      <div
        // aria-invalid + data-valid drive the validation ring styling
        // below via Tailwind's `aria-invalid:` and `data-valid:` modifiers.
        aria-invalid={status === 'invalid' ? true : undefined}
        data-valid={status === 'valid' ? '' : undefined}
        className={clsx(
          // Outset ring (not `ring-inset`) so child hover backgrounds
          // — like the Show button's — can't paint over the ring edge.
          'flex w-full overflow-hidden rounded-lg',
          'bg-white dark:bg-zinc-800',
          'ring-1 ring-zinc-300 dark:ring-zinc-700',
          'focus-within:ring-2 focus-within:ring-emerald-500/60 dark:focus-within:ring-emerald-400/60',
          // Invalid: red ring, regardless of focus.
          'aria-invalid:ring-2 aria-invalid:ring-red-500 dark:aria-invalid:ring-red-400',
          // Valid: green ring, regardless of focus. (The project's
          // `emerald-*` palette is remapped to blue — see tailwind.css —
          // so use Tailwind's stock `green-*` for an actual green.)
          'data-valid:ring-2 data-valid:ring-green-500 dark:data-valid:ring-green-400',
        )}
      >
        <Headless.ComboboxInput
          ref={inputRef}
          id={id}
          // No `autoFocus` here — focus is handled by the useEffect
          // above, which gates it on (pointer: fine).
          aria-label={ariaLabel}
          aria-invalid={status === 'invalid' ? true : undefined}
          placeholder={placeholder}
          displayValue={(opt: T | null) => displayValue(opt)}
          onChange={(e) => setQuery(e.target.value)}
          className={clsx(
            'block w-full min-w-0 flex-1 appearance-none bg-transparent px-3 py-2',
            'text-base/6 sm:text-sm/6',
            'text-zinc-900 placeholder:text-zinc-500',
            'dark:text-zinc-100 dark:placeholder:text-zinc-400',
            'focus:outline-none',
          )}
        />
        {trailing && (
          <div className="flex shrink-0 items-stretch border-l border-zinc-300 dark:border-zinc-700">
            {trailing}
          </div>
        )}
      </div>
      <Headless.ComboboxOptions
        anchor={{ to: 'bottom', gap: 4 }}
        transition
        className={clsx(
          'z-50 w-[var(--input-width)] max-h-72 overflow-y-auto rounded-lg p-1',
          'bg-white shadow-lg ring-1 ring-zinc-200',
          'dark:bg-zinc-800 dark:ring-zinc-700',
          'origin-top transition duration-100 ease-out',
          'data-[closed]:scale-95 data-[closed]:opacity-0',
          'focus:outline-none empty:invisible',
        )}
      >
        {filtered.map((opt, i) => (
          <Headless.ComboboxOption
            key={i}
            value={opt}
            className={clsx(
              'cursor-default rounded-md px-3 py-1.5 text-sm',
              'text-zinc-900 dark:text-zinc-100',
              'data-[focus]:bg-emerald-500 data-[focus]:text-white',
            )}
          >
            {displayValue(opt)}
          </Headless.ComboboxOption>
        ))}
      </Headless.ComboboxOptions>
    </Headless.Combobox>
  )
}
