import type { LinkProps } from '@remix-run/react'
import { Link } from '@remix-run/react'
import clsx from 'clsx'
import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
} from 'react'

export function YournameInput({
  yourname,
  error,
  readonly = false,
}: {
  yourname?: string
  error?: string | null
  readonly?: boolean
}) {
  return (
    <div className="flex w-full flex-col">
      <div className="flex w-full rounded-md bg-white text-lg ring-1 ring-inset ring-slate-200 focus-within:ring-2 focus-within:ring-slate-900">
        <p className="py-4 pl-3 font-medium text-slate-600">
          <label htmlFor="yourname">onelink.lite/</label>
        </p>
        <p className="py-4 pr-3">
          <input
            placeholder="your name"
            name="yourname"
            id="yourname"
            className="w-full font-medium text-slate-900 outline-none placeholder:font-normal"
            aria-errormessage="yourname-error"
            defaultValue={yourname}
            readOnly={readonly}
          />
        </p>
      </div>
      <ErrorLabel error={error} id="yourname-error" />
    </div>
  )
}

export function Button({
  children,
  className,
  ...other
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={clsx(
        'w-full rounded-md bg-slate-900 py-4 px-6 text-white',
        className,
      )}
      {...other}
    >
      {children}
    </button>
  )
}

export function ButtonLink({
  to,
  children,
  className,
  variation = 'primary',
  ...other
}: LinkProps & { variation?: 'primary' | 'secondary' }) {
  return (
    <Link
      className={clsx(
        'rounded-md bg-slate-900 px-4 py-3 text-white',
        variation === 'secondary' && 'bg-blue-600',
        className,
      )}
      to={to}
      {...other}
    >
      {children}
    </Link>
  )
}

export function Input({
  className,
  ...other
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={clsx(
        'w-full rounded-md px-6 py-4 text-lg outline-none ring-1 ring-inset ring-black/10 focus:ring-2 focus:ring-black',
        className,
      )}
      {...other}
    />
  )
}

export function ErrorLabel({
  className,
  id,
  error,
}: Pick<HTMLAttributes<HTMLSpanElement>, 'id' | 'className'> & {
  error?: string | null
}) {
  if (!error) return null

  return (
    <span id={id} className={clsx('text-sm text-red-600', className)}>
      {error}
    </span>
  )
}
