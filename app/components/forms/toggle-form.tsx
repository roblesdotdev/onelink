import * as Switch from '@radix-ui/react-switch'
import { Form, useSubmit } from '@remix-run/react'

export default function ToggleForm({
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
        className="relative h-6 w-10 rounded-full bg-gray-400 data-[state=checked]:bg-black"
      >
        <Switch.Thumb className="block h-5 w-5 translate-x-[2px] rounded-full bg-white transition data-[state=checked]:translate-x-[18px]" />
      </Switch.Root>
    </Form>
  )
}
