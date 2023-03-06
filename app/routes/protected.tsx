import type { LoaderFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { Form } from '@remix-run/react'
import { useUser } from '~/utils/misc'
import { requireSessionUser } from '~/utils/session.server'

export const loader: LoaderFunction = async ({ request }) => {
  await requireSessionUser(request)

  return json({})
}

export default function ProtectedRoute() {
  const user = useUser()
  return (
    <div className="">
      <div className="mx-auto max-w-xl px-4 pt-16 pb-4">
        <h1>
          Protected Route for <span className="font-bold">{user.username}</span>
        </h1>
        <Form method="post" action="/logout">
          <button type="submit" className="text-red-600 underline">
            Logout
          </button>
        </Form>
      </div>
    </div>
  )
}
