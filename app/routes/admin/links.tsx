import type { ActionFunction, LoaderFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useFetcher, useLoaderData, useSubmit } from '@remix-run/react'
import { useEffect, useRef } from 'react'
import invariant from 'tiny-invariant'
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

type ActionData = {
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
      return json<ActionData>({ status: 'error', errors }, { status: 400 })
    }

    await createLinks({ url, title, userId })
  }

  return json({})
}

export default function Links() {
  const fetcher = useFetcher<ActionData>()
  const errors = fetcher.data?.errors
  const createFormRef = useRef<HTMLFormElement>(null)
  const { links } = useLoaderData<LoaderData>()
  const submit = useSubmit()

  useEffect(() => {
    if (!createFormRef) return
    if (fetcher.state !== 'idle') createFormRef.current?.reset()
  }, [fetcher])

  return (
    <div>
      <h1 className="mb-4 font-bold">Add Link</h1>
      <fetcher.Form
        method="post"
        noValidate
        autoCapitalize="off"
        autoComplete="off"
      >
        <input type="hidden" name="action" defaultValue="create" />
        <div className="flex flex-col">
          <label htmlFor="url">Url</label>
          <input
            className="w-full rounded-md px-2 py-3"
            name="url"
            id="url"
            placeholder="https://example.com"
            aria-errormessage="url-error"
            aria-invalid={Boolean(errors?.url)}
          />
          {errors?.url ? (
            <span id="url-error" className="text-sm text-red-600">
              {errors.url}
            </span>
          ) : null}
        </div>
        <div className="flex flex-col">
          <label htmlFor="title">Title</label>
          <input
            className="w-full rounded-md px-2 py-3"
            name="title"
            id="title"
            placeholder="My awesome url..."
            aria-errormessage="title-error"
            aria-invalid={Boolean(errors?.title)}
          />
          {errors?.title ? (
            <span id="title-error" className="text-sm text-red-600">
              {errors.title}
            </span>
          ) : null}
        </div>
        {errors?.form ? (
          <span id="title-error" className="text-sm text-red-600">
            {errors.form}
          </span>
        ) : null}

        <div className="py-4">
          <button
            disabled={fetcher.state !== 'idle'}
            className="rounded-sm bg-black py-3 px-6 text-white disabled:bg-gray-700"
            type="submit"
          >
            Create
          </button>
        </div>
      </fetcher.Form>

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
