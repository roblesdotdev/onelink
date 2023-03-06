import type { ActionFunction, LoaderFunction } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'
import type { FetcherWithComponents } from '@remix-run/react'
import { Link, useFetcher } from '@remix-run/react'
import invariant from 'tiny-invariant'
import { sendEmail } from '~/utils/email.server'
import { decrypt, encrypt } from '~/utils/encryption.server'
import { getDomainUrl } from '~/utils/misc.server'
import { createJoinSession, getSessionUser } from '~/utils/session.server'
import { validateEmail, validateEmailExistence } from '~/utils/validation'

const joinTokenQueryParam = 'token'
const tokenType = 'join'

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getSessionUser(request)
  if (user) return redirect('/')

  const joinTokenString = new URL(request.url).searchParams.get(
    joinTokenQueryParam,
  )
  if (joinTokenString) {
    const token = JSON.parse(decrypt(joinTokenString))
    if (token.type === tokenType && token.payload?.email) {
      return await createJoinSession({
        request,
        email: token.payload.email,
      })
    } else {
      return redirect('/signup')
    }
  }
  return json({})
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const { email } = Object.fromEntries(formData)
  invariant(typeof email === 'string', 'email type is invalid')

  const emailError =
    validateEmail(email) || (await validateEmailExistence(email))

  if (emailError)
    return json({ errors: { email: emailError } }, { status: 400 })

  const joinToken = encrypt(
    JSON.stringify({ type: tokenType, payload: { email } }),
  )
  const joinUrl = new URL(`${getDomainUrl(request)}/signup`)
  joinUrl.searchParams.set(joinTokenQueryParam, joinToken)

  const response = await sendEmail({
    to: email,
    subject: 'Verify your email',
    text: `Please open this URL: ${joinUrl}`,
  })

  if (response.ok) {
    return json({ status: 'success' })
  }

  return json({
    status: 'error',
    errors: { form: 'Email is not sent successfully!' },
  })
}

export default function Signup() {
  const fetcher = useFetcher()

  const isSuccess = fetcher.data?.status === 'success'

  return (
    <div>
      <div className="mx-auto max-w-xl px-4 pt-16 pb-4">
        <h1 className="mb-4 text-xl font-bold">Register</h1>
        {isSuccess ? (
          <h2>Please check your email</h2>
        ) : (
          <RegisterForm fetcher={fetcher} />
        )}
      </div>
      <div className="mx-auto max-w-xl px-4">
        <p>
          Do you already have an account?{' '}
          <Link className="text-blue-600 underline" to="/login">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}

function RegisterForm({ fetcher }: { fetcher: FetcherWithComponents<any> }) {
  const errors = fetcher.data?.errors
  return (
    <fetcher.Form method="post" noValidate aria-describedby="form-error">
      <h2>We need your email to continue</h2>
      <div className="flex flex-col py-2">
        <input
          className="w-full rounded-md px-2 py-3"
          placeholder="Enter your email address..."
          type="text"
          name="email"
          id="email"
          aria-describedby="email-error"
          aria-invalid={Boolean(errors?.email)}
        />
        {errors?.email ? (
          <span id="email-error" className="text-sm text-red-600">
            {errors.email}
          </span>
        ) : null}
      </div>
      <div className="mt-4">
        <button
          type="submit"
          className="rounded-md bg-black py-3 px-8 text-white"
          disabled={fetcher.state !== 'idle'}
        >
          Continue
        </button>
      </div>
    </fetcher.Form>
  )
}
