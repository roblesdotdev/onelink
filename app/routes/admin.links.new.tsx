import * as Dialog from '@radix-ui/react-dialog'
import type { ActionFunction } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import { json } from '@remix-run/node'
import {
  Form,
  useActionData,
  useNavigate,
  useNavigation,
} from '@remix-run/react'
import invariant from 'tiny-invariant'
import { createLinks } from '~/utils/link.server'
import { requireSessionUser } from '~/utils/session.server'
import { validateTitle, validateUrl } from '~/utils/validation'

type ActionData = {
  status: 'error' | 'success'
  errors?: {
    url?: string | null
    title?: string | null
    form?: string | null
  } | null
}

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireSessionUser(request)
  const formData = await request.formData()
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

  const link = await createLinks({ url, title, userId })

  if (link) return redirect('/admin/links')

  return json<ActionData>(
    { status: 'error', errors: { form: 'Something went wrong' } },
    { status: 400 },
  )
}

export default function NewLink() {
  const navigate = useNavigate()
  const navigation = useNavigation()
  const actionData = useActionData<ActionData>()
  const errors = actionData?.errors

  const onDismiss = () => {
    navigate('/admin/links')
  }

  return (
    <Dialog.Root open={true} onOpenChange={onDismiss}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/10" />
        <Dialog.Content className="fixed inset-x-0 top-16 m-auto w-[90vw] max-w-[450px] rounded-sm bg-white p-6 shadow">
          <Dialog.Title className="text-lg font-bold">New link</Dialog.Title>
          <div className="mt-2">
            <Form
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

              <div className="flex items-center gap-4 py-4">
                <button
                  disabled={navigation.state !== 'idle'}
                  className="rounded-sm bg-black py-3 px-6 text-white disabled:bg-gray-700"
                  type="submit"
                >
                  Create
                </button>
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="underline"
                    onClick={() => {}}
                  >
                    Cancel
                  </button>
                </Dialog.Close>
              </div>
            </Form>
          </div>

          <Dialog.Close asChild>
            <button
              className="absolute top-4 right-3 inline-flex h-6 w-6 items-center justify-center"
              aria-label="Close"
            >
              X
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
