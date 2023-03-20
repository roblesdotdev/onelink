import type { ActionFunction, LoaderFunction } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useFetcher, useLoaderData } from '@remix-run/react'
import invariant from 'tiny-invariant'
import { Button, ErrorLabel, Input, YournameInput } from '~/components/lib'
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
    <div className="py-6">
      <fetcher.Form method="post" noValidate>
        <div className="mx-auto max-w-xl px-4 pt-12 pb-4">
          <div className="mb-4 flex flex-col gap-2">
            <h1 className="text-3xl font-bold">Just one step away</h1>
            <p>Choose your password for your account.</p>
          </div>

          <div className="mb-2">
            <YournameInput yourname={data.yourname} readonly />
          </div>
          <div className="mb-2 flex flex-col">
            <Input
              placeholder="Enter your password..."
              type="password"
              name="password"
              id="password"
              aria-describedby="password-error"
              aria-invalid={Boolean(errors?.password)}
            />
            <ErrorLabel error={errors?.password} id="password-error" />
          </div>
          <div className="mb-2 flex flex-col">
            <Input
              placeholder="Confirm your password..."
              type="password"
              name="confirmPassword"
              id="confirmPassword"
              aria-describedby="confirmPassword-error"
              aria-invalid={Boolean(errors?.confirmPassword)}
            />
            <ErrorLabel
              error={errors?.confirmPassword}
              id="confirmPassword-error"
            />
          </div>
          <div className="mt-6 py-2 text-sm text-slate-500">
            <p>
              By clicking Create account, you agree to Terms and Conditions.
            </p>
          </div>

          <div className="mt-4">
            <Button type="submit" disabled={fetcher.state !== 'idle'}>
              Create account
            </Button>
          </div>
        </div>
      </fetcher.Form>
    </div>
  )
}
