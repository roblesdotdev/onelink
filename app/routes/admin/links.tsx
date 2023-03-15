import type { ActionFunction, LoaderFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useFetcher, useLoaderData, useSubmit } from '@remix-run/react'
import { useState } from 'react'
import invariant from 'tiny-invariant'
import { CreateForm } from '~/components/forms'
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
  const [isOpen, setIsOpen] = useState(false)
  const fetcher = useFetcher<LinksActionData>()
  const { links } = useLoaderData<LoaderData>()
  const submit = useSubmit()

  return (
    <div>
      <button className="mb-4 font-bold" onClick={() => setIsOpen(true)}>
        Add Link
      </button>
      <CreateForm
        isOpen={isOpen}
        closeModal={() => setIsOpen(false)}
        fetcher={fetcher}
      />
      <div>
        {links.map(link => (
          <div key={link.id} className="rounded-md bg-white p-4 shadow">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="font-bold">{link.title}</h1>
                <h2>{link.url}</h2>
              </div>
              <fetcher.Form
                className="px-4 py-1"
                method="post"
                noValidate
                onChange={e => submit(e.currentTarget, { replace: true })}
              >
                <input type="hidden" name="action" defaultValue="toggle" />
                <input type="hidden" name="linkId" defaultValue={link.id} />
                <input
                  type="checkbox"
                  defaultChecked={link.published}
                  name="published"
                />
              </fetcher.Form>
            </div>
            <fetcher.Form className="mt-2 flex" method="post" noValidate>
              <input type="hidden" name="action" defaultValue="delete" />
              <input type="hidden" name="linkId" defaultValue={link.id} />
              <button type="submit">Delete</button>
            </fetcher.Form>
          </div>
        ))}
      </div>
    </div>
  )
}
