import * as Collapsible from '@radix-ui/react-collapsible'
import { Form } from '@remix-run/react'
import { useState } from 'react'

export default function DeleteForm({ linkId }: { linkId: string }) {
  const [open, setOpen] = useState(false)
  return (
    <Form className="mt-2 flex" method="post" noValidate>
      <input type="hidden" name="action" defaultValue="delete" />
      <input type="hidden" name="linkId" defaultValue={linkId} />

      <Collapsible.Root open={open} onOpenChange={() => setOpen(!open)}>
        <div className="flex items-center justify-between">
          <Collapsible.Trigger asChild>
            <button className="py-2 underline">Delete</button>
          </Collapsible.Trigger>
        </div>

        <Collapsible.Content>
          <div className="flex items-center gap-4">
            <button type="submit" className="text-red-600">
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
