import type {
  LinksFunction,
  LoaderFunction,
  MetaFunction,
} from '@remix-run/node'
import { json } from '@remix-run/node'
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
} from '@remix-run/react'
import type { ReactNode } from 'react'
import tailwindStyles from '~/styles/tailwind.css'
import { NotFound, ServerError } from './components/errors'
import { getUserById } from './utils/auth.server'
import { getSession, getSessionUser } from './utils/session.server'

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: tailwindStyles },
]

export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  title: 'Onelink',
  description: 'The amazing link for everything',
  viewport: 'width=device-width,initial-scale=1',
})

type UserResponse = Awaited<ReturnType<typeof getUserById>>

export type RootLoaderData = {
  user?: UserResponse | null
}

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getSessionUser(request)
  const { signOut } = await getSession(request)
  let user: UserResponse = null
  if (userId) {
    user = await getUserById(userId)
    if (!user) {
      await signOut()
    }
  }

  return json<RootLoaderData>({ user })
}

function Document({
  title,
  children,
}: {
  title?: string
  children: ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {title ? <title>{title}</title> : null}
        <Meta />
        <Links />
      </head>
      <body className="min-h-screen w-full overflow-x-hidden antialiased">
        <div className=" bg-slate-50 text-slate-800">
          <main>{children}</main>
        </div>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}

export default function App() {
  return (
    <Document>
      <Outlet />
    </Document>
  )
}

export function CatchBoundary() {
  const caught = useCatch()
  if (caught.status === 404) {
    return (
      <Document title="Oh No! Not Found">
        <NotFound />
      </Document>
    )
  }
  throw new Error(`Unhandled error: ${caught.status}`)
}

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <Document title="Uh-oh!">
      <ServerError error={error} />
    </Document>
  )
}
