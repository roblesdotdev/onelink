import type { ActionFunction, LoaderFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import invariant from 'tiny-invariant'
import { CreateForm, DeleteForm, ToggleForm } from '~/components/forms'
import {
  createLinks,
  deleteLink,
  getUserLinks,
  toggleLinkVisibility,
} from '~/utils/link.server'
import { requireSessionUser, requireUser } from '~/utils/session.server'
import { validateTitle, validateUrl } from '~/utils/validation'

type LoaderData = {
  links: Awaited<ReturnType<typeof getUserLinks>>
}

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireUser(request)
  const links = await getUserLinks(user.id)

  return json<LoaderData>({ links })
}

export type LinksActionData = {
  status: 'success' | 'error'
  errors?: {
    url?: string | null
    title?: string | null
    form?: string | null
  } | null
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const userId = await requireSessionUser(request)
  const { action, linkId, url, title, published } = Object.fromEntries(formData)
  invariant(typeof action === 'string', 'action type is invalid')
  if (action === 'delete') {
    invariant(typeof linkId === 'string', 'linkId type is invalid')
    await deleteLink(linkId)
  }
  if (action === 'toggle') {
    invariant(typeof linkId === 'string', 'linkId type is invalid')
    console.log(published)
    await toggleLinkVisibility({ id: linkId, published: published === 'on' })
  }

  if (action === 'create') {
    invariant(typeof url === 'string', 'url type is invalid')
    invariant(typeof title === 'string', 'title type is invalid')

    const errors = {
      url: validateUrl(url),
      title: validateTitle(title),
    }

    if (Object.values(errors).some(Boolean)) {
      return json<LinksActionData>({ status: 'error', errors }, { status: 400 })
    }

    await createLinks({ url, title, userId })
  }

  return json<LinksActionData>({ status: 'success' })
}

export default function Links() {
  const { links } = useLoaderData<LoaderData>()

  return (
    <div>
      <CreateForm />
      <div>
        {links.map(link => (
          <div key={link.id} className="rounded-md bg-white p-4 shadow">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="font-bold">{link.title}</h1>
                <h2>{link.url}</h2>
              </div>
              <ToggleForm published={link.published} linkId={link.id} />
            </div>
            <DeleteForm linkId={link.id} />
          </div>
        ))}
      </div>
    </div>
  )
}
