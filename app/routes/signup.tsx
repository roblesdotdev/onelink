import type { ActionFunction, LoaderFunction } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'
import { Form, useLoaderData } from '@remix-run/react'
import { Link } from '@remix-run/react'
import invariant from 'tiny-invariant'
import { Button, ErrorLabel, Input, YournameInput } from '~/components/lib'
import { sendEmail } from '~/utils/email.server'
import { decrypt, encrypt } from '~/utils/encryption.server'
import { getJoinInfoSession } from '~/utils/join.server'
import { getDomainUrl } from '~/utils/misc.server'
import { getSessionUser } from '~/utils/session.server'
import {
  validateEmail,
  validateEmailExistence,
  validateUsername,
  validateUsernameExistence,
} from '~/utils/validation'

const joinTokenQueryParam = 'token'
const tokenType = 'join'

type LoaderData = {
  status: 'success' | 'error'
  yourname?: string
  email?: string
  errors?: {
    yourname?: string | null
    email?: string | null
    form?: string | null
  } | null
}

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getSessionUser(request)
  const joinInfoSession = await getJoinInfoSession(request)
  if (user) {
    joinInfoSession.clean()
    return redirect('/admin', {
      headers: await joinInfoSession.getHeaders(),
    })
  }
  const joinTokenString = new URL(request.url).searchParams.get(
    joinTokenQueryParam,
  )
  if (joinTokenString) {
    const token = JSON.parse(decrypt(joinTokenString))
    if (
      token.type === tokenType &&
      token.payload?.email &&
      token.payload?.yourname
    ) {
      joinInfoSession.setEmail(token.payload.email)
      joinInfoSession.setYourname(token.payload.yourname)
      joinInfoSession.cleanErrors()
      return redirect('/join', {
        headers: await joinInfoSession.getHeaders(),
      })
    } else {
      joinInfoSession.flashError({
        key: 'error-form',
        error: 'Ups something went wrong',
      })
      return redirect('/signup', {
        headers: await joinInfoSession.getHeaders(),
      })
    }
  }
  const errors = {
    yourname: joinInfoSession.getError('error-yourname'),
    email: joinInfoSession.getError('error-email'),
    form: joinInfoSession.getError('error-form'),
  }
  const yourname = joinInfoSession.getYourname()
  const email = joinInfoSession.getEmail()

  const status =
    Object.values(errors).some(Boolean) || !yourname || !email
      ? 'error'
      : 'success'

  return json<LoaderData>({
    status,
    yourname,
    email,
    errors,
  })
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const joinInfoSession = await getJoinInfoSession(request)
  const { email, yourname } = Object.fromEntries(formData)
  invariant(typeof email === 'string', 'email type is invalid')
  invariant(typeof yourname === 'string', 'yourname type is invalid')

  let yournameError: string | null | undefined =
    joinInfoSession.getError('error-yourname')
  if (
    !joinInfoSession.getYourname() ||
    yourname !== joinInfoSession.getYourname()
  ) {
    joinInfoSession.setYourname(yourname)
    const error =
      validateUsername(yourname) || (await validateUsernameExistence(yourname))
    if (error) {
      joinInfoSession.flashError({ key: 'error-yourname', error })
      yournameError = error
    }
  }

  let emailError: string | null | undefined =
    joinInfoSession.getError('error-email')
  if (!joinInfoSession.getEmail() || email !== joinInfoSession.getEmail()) {
    joinInfoSession.setEmail(email)
    const error = validateEmail(email) || (await validateEmailExistence(email))
    if (error) {
      joinInfoSession.flashError({ key: 'error-email', error })
      emailError = error
    }
  }

  const errors = {
    yourname: yournameError,
    email: emailError,
  }

  if (Object.values(errors).some(Boolean))
    return redirect('/signup', {
      status: 400,
      headers: await joinInfoSession.getHeaders(),
    })

  const joinToken = encrypt(
    JSON.stringify({ type: tokenType, payload: { email, yourname } }),
  )
  const joinUrl = new URL(`${getDomainUrl(request)}/signup`)
  joinUrl.searchParams.set(joinTokenQueryParam, joinToken)

  const response = await sendEmail({
    to: email,
    subject: 'Verify your email',
    text: `Please open this URL: ${joinUrl}`,
  })

  if (response.ok) {
    joinInfoSession.cleanErrors()
    return redirect('/signup', { headers: await joinInfoSession.getHeaders() })
  }

  return json({})
}

export default function Signup() {
  const data = useLoaderData<LoaderData>()

  const isSuccess = data.status === 'success'

  return (
    <div>
      <div className="mx-auto max-w-xl px-4 pt-16 pb-4">
        <h1 className="mb-4 text-xl font-bold">Create your account</h1>
        {isSuccess ? (
          <h2>Please check your email</h2>
        ) : (
          <RegisterForm data={data} />
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

function RegisterForm({ data }: { data: LoaderData }) {
  const errors = data.errors
  return (
    <Form method="post" noValidate aria-errormessage="form-error">
      <h2>Choose your username and enter your email to continue.</h2>
      <div className="py-2">
        <YournameInput error={data.errors?.yourname} yourname={data.yourname} />
      </div>
      <div className="flex flex-col py-2">
        <Input
          placeholder="Enter your email address..."
          type="text"
          name="email"
          id="email"
          aria-errormessage="email-error"
          aria-invalid={Boolean(errors?.email)}
        />
        <ErrorLabel error={errors?.email} id="email-error" />
      </div>

      <ErrorLabel error={errors?.form} id="form-error" />

      <div className="mt-4">
        <Button type="submit">Continue</Button>
      </div>
    </Form>
  )
}
