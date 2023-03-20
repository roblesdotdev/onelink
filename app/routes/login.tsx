import type { ActionFunction, LoaderFunction } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import { json } from '@remix-run/node'
import { Link, useFetcher, useSearchParams } from '@remix-run/react'
import invariant from 'tiny-invariant'
import { Button, ErrorLabel, Input, YournameInput } from '~/components/lib'
import { verifyCredentials } from '~/utils/auth.server'
import { createUserSession, getSessionUser } from '~/utils/session.server'
import { validatePassword, validateUsername } from '~/utils/validation'

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getSessionUser(request)

  if (user) return redirect('/admin')

  return json({})
}

type ActionData = {
  status: 'success' | 'error'
  errors?: {
    username?: string | null
    password?: string | null
    form?: string | null
  } | null
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const { yourname, password, remember, redirectTo } =
    Object.fromEntries(formData)
  invariant(typeof yourname === 'string', 'username type invalid')
  invariant(typeof password === 'string', 'password type invalid')
  invariant(typeof redirectTo === 'string', 'redirectTo type invalid')

  const errors = {
    yourname: validateUsername(yourname),
    password: validatePassword(password),
  }

  if (Object.values(errors).some(Boolean)) {
    return json<ActionData>({ status: 'error', errors }, { status: 400 })
  }

  const user = await verifyCredentials({ username: yourname, password })
  if (!user) {
    return json<ActionData>(
      { status: 'error', errors: { form: 'Invalid username or password' } },
      { status: 400 },
    )
  }

  return await createUserSession({
    request,
    userId: user.id,
    remember: remember === 'on',
    redirectTo,
  })
}

export default function LoginRoute() {
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/'
  const fetcher = useFetcher()
  const errors = fetcher.data?.errors

  return (
    <div className="py-6">
      <fetcher.Form method="post" noValidate aria-describedby="form-error">
        <div className="mx-auto max-w-xl px-4 pt-12 pb-4">
          <div className="mb-6 flex flex-col gap-2">
            <h1 className="text-3xl font-bold">
              Welcome back to <span className="text-blue-700">onelink</span>
            </h1>
            <p className="text-lg">Sign in to your account bellow.</p>
          </div>
          <YournameInput error={errors?.yourname} />
          <div className="mt-2 flex flex-col py-2">
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
          <div className="space-x-2 py-2">
            <input type="checkbox" name="redirectTo" id="redirectTo" />
            <label htmlFor="redirectTo">Remember me</label>
          </div>
          <input type="hidden" name="redirectTo" defaultValue={redirectTo} />
          <ErrorLabel error={errors?.form} id="form-error" />
          <div className="mt-4">
            <Button type="submit" disabled={fetcher.state !== 'idle'}>
              Log in
            </Button>
          </div>
        </div>
      </fetcher.Form>
      <div className="mx-auto max-w-xl px-4">
        <p>
          Don't have an account yet?{' '}
          <Link className="text-blue-600 underline" to="/signup">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
