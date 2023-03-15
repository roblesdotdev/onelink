import type { ActionFunction, LoaderFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import { Form } from '@remix-run/react'
import invariant from 'tiny-invariant'
import { YournameInput } from '~/components/forms'
import { getJoinInfoSession } from '~/utils/join.server'
import { getSessionUser } from '~/utils/session.server'
import { validateUsernameExistence } from '~/utils/validation'

export const tokenType = 'join'
export const joinTokenQueryParam = 'token'

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getSessionUser(request)
  const joinInfoSession = await getJoinInfoSession(request)

  if (user)
    return redirect('/admin', {
      headers: {
        'Set-Cookie': await joinInfoSession.destroy(),
      },
    })

  return json({})
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const joinInfoSession = await getJoinInfoSession(request)
  const yourname = formData.get('yourname')
  invariant(typeof yourname === 'string', 'yourname type is invalid')
  if (yourname) {
    joinInfoSession.setYourname(yourname)
    const error = await validateUsernameExistence(yourname)
    if (error) joinInfoSession.flashError({ key: 'error-yourname', error })
  }

  return redirect('/signup', {
    headers: await joinInfoSession.getHeaders(),
  })
}

export default function Index() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p>Just One Link</p>
      <h1 className="text-xl font-bold">The Amazing Link For Everithing</h1>
      <div className="py-6">
        <Form
          method="post"
          autoComplete="off"
          noValidate
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck="false"
          className="flex flex-wrap gap-2"
        >
          <YournameInput />
          <button
            type="submit"
            className="whitespace-nowrap rounded-md bg-slate-900 px-3 py-4 text-white"
          >
            Create My Link
          </button>
        </Form>
      </div>
      <p>It's free and take less than a minute.</p>
    </div>
  )
}
