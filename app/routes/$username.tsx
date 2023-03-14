import type { LoaderFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import invariant from 'tiny-invariant'
import { db } from '~/utils/db.server'
import { getPublicUserLinks } from '~/utils/link.server'

type LoaderData = {
  status: 'success' | 'error'
  username: string
  links?: Awaited<ReturnType<typeof getPublicUserLinks>>
}

export const loader: LoaderFunction = async ({ params }) => {
  const username = params.username
  invariant(typeof username === 'string', 'username is invalid')
  const user = await db.user.findUnique({ where: { username } })
  if (!user) {
    throw new Response('Not found', { status: 404 })
  }

  const links = await getPublicUserLinks(user.id)
  return json<LoaderData>({
    status: 'success',
    username,
    links,
  })
}

export default function UserLinks() {
  const { username, links } = useLoaderData<LoaderData>()
  const hasLinks = links && links.length > 0
  return (
    <div className="py-16 text-center">
      <header className="flex flex-col items-center px-8">
        <div className="h-24 w-24 rounded-full bg-black/30" />
        <h1 className="mt-3 text-xl font-bold">@{username}</h1>
        <h2 className="mt-1 text-sm sm:text-base">
          Web developer expert in creating modern and optimized sites. Contact
          me.
        </h2>
      </header>
      <section className="mx-auto mt-6 flex max-w-2xl flex-col gap-3 px-4">
        {hasLinks
          ? links.map(link => (
              <div key={link.id} className="flex">
                <a
                  className="w-full rounded-md bg-black py-4 text-white"
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {link.title}
                </a>
              </div>
            ))
          : null}
      </section>
    </div>
  )
}
