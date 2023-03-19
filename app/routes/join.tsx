import type { ActionFunction, LoaderFunction } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useFetcher, useLoaderData } from '@remix-run/react'
import invariant from 'tiny-invariant'
import { YournameInput } from '~/components/lib'
import { createUser } from '~/utils/auth.server'
import { getJoinInfoSession } from '~/utils/join.server'
import { createUserSession } from '~/utils/session.server'
import { validateConfirmPassword, validatePassword } from '~/utils/validation'

export const loader: LoaderFunction = async ({ request }) => {
  const joinInfoSession = await getJoinInfoSession(request)
  const joinEmail = joinInfoSession.getEmail()
  const yourname = joinInfoSession.getYourname()

  if (!joinEmail || !yourname) {
    joinInfoSession.flashError({
      key: 'error-form',
      error: 'Please enter a valid data',
    })
    return redirect('/signup', { headers: await joinInfoSession.getHeaders() })
  }

  return json({
    joinEmail,
    yourname,
  })
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const joinInfoSession = await getJoinInfoSession(request)
  const email = joinInfoSession.getEmail()
  const yourname = joinInfoSession.getYourname()
  const { password, confirmPassword } = Object.fromEntries(formData)
  invariant(typeof email === 'string', 'email type is invalid')
  invariant(typeof yourname === 'string', 'yourname type is invalid')
  invariant(typeof password === 'string', 'password type is invalid')
  invariant(
    typeof confirmPassword === 'string',
    'confirmPassword type is invalid',
  )

  const errors = {
    password: validatePassword(password),
    confirmPassword: validateConfirmPassword(password, confirmPassword),
  }

  if (Object.values(errors).some(Boolean)) {
    return json({ status: 'error', errors }, { status: 400 })
  }

  const user = await createUser({ email, username: yourname, password })

  await joinInfoSession.destroy()

  return await createUserSession({
    request,
    userId: user.id,
    remember: true,
    redirectTo: '/',
  })
}

export default function Join() {
  const data = useLoaderData()
  const fetcher = useFetcher()
  const errors = fetcher.data?.errors
  return (
    <div>
      <fetcher.Form method="post" noValidate>
        <div className="mx-auto max-w-xl px-4 pt-16 pb-4">
          <h1 className="mb-4 text-xl font-bold">Just one step</h1>
          <YournameInput yourname={data.yourname} readonly />
          <div className="flex flex-col py-2">
            <label htmlFor="password">Password</label>
            <input
              className="w-full rounded-md px-2 py-3"
              placeholder="Enter your password..."
              type="password"
              name="password"
              id="password"
              aria-describedby="password-error"
              aria-invalid={Boolean(errors?.password)}
            />
            {errors?.password ? (
              <span id="password-error" className="text-sm text-red-600">
                {errors.password}
              </span>
            ) : null}
          </div>
          <div className="flex flex-col py-2">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              className="w-full rounded-md px-2 py-3"
              placeholder="Confirm your password..."
              type="password"
              name="confirmPassword"
              id="confirmPassword"
              aria-describedby="confirmPassword-error"
              aria-invalid={Boolean(errors?.confirmPassword)}
            />
            {errors?.confirmPassword ? (
              <span id="confirmPassword-error" className="text-sm text-red-600">
                {errors.confirmPassword}
              </span>
            ) : null}
          </div>

          <div className="mt-4">
            <button
              type="submit"
              className="rounded-md bg-black py-3 px-8 text-white"
              disabled={fetcher.state !== 'idle'}
            >
              Register
            </button>
          </div>
        </div>
      </fetcher.Form>
    </div>
  )
}
