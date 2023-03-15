import { Dialog, Transition } from '@headlessui/react'
import type { FetcherWithComponents } from '@remix-run/react'
import { Fragment, useEffect, useState } from 'react'
import type { LinksActionData } from '~/routes/admin/links'

export default function CreateForm({
  isOpen,
  closeModal,
  fetcher,
}: {
  isOpen: boolean
  closeModal: () => void
  fetcher: FetcherWithComponents<LinksActionData>
}) {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const errors = fetcher.data?.errors
  const isSuccess = fetcher.data?.status === 'success'
  const isIdle = fetcher.state === 'idle'

  useEffect(() => {
    if (isIdle && isSubmitted && isSuccess) {
      setIsSubmitted(false)
      closeModal()
    }
  }, [isSuccess, closeModal, isSubmitted, isIdle])

  const handleClose = () => {
    setIsSubmitted(false)
    closeModal()
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
        </Transition.Child>

        <div className="fixed inset-x-0 top-0 overflow-y-auto sm:inset-0">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  Create new link
                </Dialog.Title>
                <div className="mt-2">
                  <fetcher.Form
                    method="post"
                    noValidate
                    autoCapitalize="off"
                    autoComplete="off"
                    onSubmit={() => setIsSubmitted(true)}
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
                      {isSubmitted && errors?.url ? (
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
                      {isSubmitted && errors?.title ? (
                        <span id="title-error" className="text-sm text-red-600">
                          {errors.title}
                        </span>
                      ) : null}
                    </div>
                    {isSubmitted && errors?.form ? (
                      <span id="title-error" className="text-sm text-red-600">
                        {errors.form}
                      </span>
                    ) : null}

                    <div className="flex items-center gap-4 py-4">
                      <button
                        disabled={fetcher.state !== 'idle'}
                        className="rounded-sm bg-black py-3 px-6 text-white disabled:bg-gray-700"
                        type="submit"
                      >
                        Create
                      </button>
                      <button
                        type="button"
                        className="underline"
                        onClick={handleClose}
                      >
                        Cancel
                      </button>
                    </div>
                  </fetcher.Form>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
