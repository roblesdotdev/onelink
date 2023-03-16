import * as Dialog from '@radix-ui/react-dialog'
import { useNavigation } from '@remix-run/react'
import { useActionData } from '@remix-run/react'
import { Form } from '@remix-run/react'
import { useEffect, useState } from 'react'
import type { LinksActionData } from '~/routes/admin/links'

export default function CreateForm() {
  const [open, setOpen] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const navigation = useNavigation()
  const actionData = useActionData<LinksActionData>()
  const errors = actionData?.errors
  const isIdle = navigation.state === 'idle'
  const isSuccess = actionData?.status === 'success'

  useEffect(() => {
    if (isSubmitted && isSuccess && isIdle) setOpen(false)
  }, [isSubmitted, isSuccess, isIdle, setOpen])

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="rounded-sm bg-black px-6 py-3 text-sm font-bold text-white">
          New Link
        </button>
      </Dialog.Trigger>
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
              onSubmit={() => {
                setIsSubmitted(true)
              }}
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
