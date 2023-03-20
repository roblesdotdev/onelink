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
import { XMarkIcon } from '~/components/icons'
import { Button, ErrorLabel, Input } from '~/components/lib'
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
        <Dialog.Overlay className="fixed inset-0 overflow-y-auto bg-black/10" />
        <Dialog.Content className="fixed inset-x-4 top-8 mx-auto max-w-[450px] rounded-md bg-white px-6 pt-12 pb-6 shadow">
          <Dialog.Title className="text-lg font-bold">New link</Dialog.Title>
          <div className="mt-2">
            <Form
              method="post"
              noValidate
              autoCapitalize="off"
              autoComplete="off"
            >
              <div className="mb-2 flex flex-col">
                <label htmlFor="url">Url</label>
                <Input
                  name="url"
                  id="url"
                  placeholder="https://example.com"
                  aria-errormessage="url-error"
                  aria-invalid={Boolean(errors?.url)}
                />
                <ErrorLabel error={errors?.url} id="url-error" />
              </div>
              <div className="mb-2 flex flex-col">
                <label htmlFor="title">Title</label>
                <Input
                  name="title"
                  id="title"
                  placeholder="My awesome url..."
                  aria-errormessage="title-error"
                  aria-invalid={Boolean(errors?.title)}
                />
                <ErrorLabel error={errors?.title} id="title-error" />
              </div>
              <ErrorLabel error={errors?.form} id="title-error" />

              <div className="flex items-center gap-4 py-4">
                <Button
                  className="max-w-max"
                  disabled={navigation.state !== 'idle'}
                  type="submit"
                >
                  Create
                </Button>
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
              className="absolute top-4 right-4 inline-flex h-6 w-6 items-center justify-center"
              aria-label="Close"
            >
              <XMarkIcon />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
