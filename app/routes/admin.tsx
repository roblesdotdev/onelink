import type { LoaderFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { Form, Outlet } from '@remix-run/react'
import { useUser } from '~/utils/misc'
import { requireUser } from '~/utils/session.server'

export const loader: LoaderFunction = async ({ request }) => {
  await requireUser(request)

  return json({})
}

export default function Admin() {
  const user = useUser()
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex items-center justify-between py-6 px-4">
        <h1 className="text-xl font-bold">{user.username}</h1>
        <Form method="post" action="/logout">
          <button type="submit">Logout</button>
        </Form>
      </div>
      <div className="px-4">
        <Outlet />
      </div>
    </div>
  )
}
