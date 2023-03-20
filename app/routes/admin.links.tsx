import * as Collapsible from '@radix-ui/react-collapsible'
import * as Switch from '@radix-ui/react-switch'
import type { ActionFunction, LoaderFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { Form, Link, Outlet, useLoaderData, useSubmit } from '@remix-run/react'
import { useState } from 'react'
import invariant from 'tiny-invariant'
import { GridIcon, PlusIcon, ThrashIcon } from '~/components/icons'
import {
  deleteLink,
  getUserLinks,
  toggleLinkVisibility,
} from '~/utils/link.server'
import { requireUser } from '~/utils/session.server'

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
  const { action, linkId, published } = Object.fromEntries(formData)
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

  return json<LinksActionData>({ status: 'success' })
}

export default function Links() {
  const { links } = useLoaderData<LoaderData>()

  return (
    <div>
      <Outlet />
      <div className="flex items-center py-4">
        <Link
          className="flex w-full items-center justify-center gap-2 rounded-md bg-slate-900 py-4 text-white"
          to="new"
        >
          <span>Create a new link</span>
          <PlusIcon />
        </Link>
      </div>
      <div className="flex flex-col gap-2">
        {links.map(link => (
          <div key={link.id} className="rounded-md bg-white py-4 px-2 shadow">
            <div className="flex gap-4">
              <div className="p-2 text-gray-400/60">
                <GridIcon />
              </div>
              <div className="flex flex-1 flex-col">
                <div className="flex w-full items-start justify-between gap-4">
                  <div>
                    <h1 className="font-bold">{link.title}</h1>
                    <h2>{link.url}</h2>
                  </div>
                  <ToggleForm published={link.published} linkId={link.id} />
                </div>
                <DeleteForm linkId={link.id} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function DeleteForm({ linkId }: { linkId: string }) {
  const [open, setOpen] = useState(false)
  return (
    <Form className="mt-3 flex" method="post" noValidate>
      <input type="hidden" name="action" defaultValue="delete" />
      <input type="hidden" name="linkId" defaultValue={linkId} />

      <Collapsible.Root open={open} onOpenChange={() => setOpen(!open)}>
        <div className="flex items-center justify-between">
          <Collapsible.Trigger asChild>
            <button className="flex items-center gap-2 rounded-md bg-slate-100 p-2">
              <ThrashIcon className="h-4 w-4" />
            </button>
          </Collapsible.Trigger>
        </div>

        <Collapsible.Content>
          <div className="mt-4 flex items-center gap-4">
            <button
              type="submit"
              className="rounded-md bg-red-600 py-2 px-4 text-white"
            >
              Confirm
            </button>
            <button
              type="button"
              className="underline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </button>
          </div>
        </Collapsible.Content>
      </Collapsible.Root>
    </Form>
  )
}

function ToggleForm({
  published,
  linkId,
}: {
  published: boolean
  linkId: string
}) {
  const submit = useSubmit()
  return (
    <Form
      className="px-4 py-1"
      method="post"
      noValidate
      onChange={e => submit(e.currentTarget, { replace: true })}
    >
      <input type="hidden" name="action" defaultValue="toggle" />
      <input type="hidden" name="linkId" defaultValue={linkId} />
      <Switch.Root
        id="airplane-mode"
        defaultChecked={published}
        name="published"
        className="relative h-6 w-10 rounded-full bg-gray-400/60 data-[state=checked]:bg-slate-900"
      >
        <Switch.Thumb className="block h-5 w-5 translate-x-[2px] rounded-full bg-white transition data-[state=checked]:translate-x-[18px]" />
      </Switch.Root>
    </Form>
  )
}
