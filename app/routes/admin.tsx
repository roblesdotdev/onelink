import { Form } from '@remix-run/react'
import { useUser } from '~/utils/misc'

export default function Admin() {
  const user = useUser()
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-2xl font-bold">Welcome {user.username}</h1>
      <Form method="post" action="/logout">
        <button type="submit">Logout</button>
      </Form>
    </div>
  )
}
