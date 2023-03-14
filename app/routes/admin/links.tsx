import type { ActionFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { useFetcher } from '@remix-run/react'
import invariant from 'tiny-invariant'
import { createLinks } from '~/utils/link.server'
import { requireSessionUser } from '~/utils/session.server'
import { validateTitle, validateUrl } from '~/utils/validation'

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
  const { url, title } = Object.fromEntries(formData)
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

  return json({})
}

export default function Links() {
  const fetcher = useFetcher<ActionData>()
  const errors = fetcher.data?.errors

  return (
    <div>
      <h1 className="mb-4 font-bold">Add Link</h1>
      <fetcher.Form
        method="post"
        noValidate
        autoCapitalize="off"
        autoComplete="off"
      >
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
    </div>
  )
}
