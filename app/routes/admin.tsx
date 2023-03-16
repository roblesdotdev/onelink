import * as Popover from '@radix-ui/react-popover'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import type { LoaderFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { Link, NavLink, Outlet, useNavigate, useSubmit } from '@remix-run/react'
import { useUser } from '~/utils/misc'
import { requireUser } from '~/utils/session.server'
import useCopyToClipboard from '~/utils/hooks'

export const loader: LoaderFunction = async ({ request }) => {
  await requireUser(request)

  return json({})
}

export default function Admin() {
  const user = useUser()
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar username={user.username} />
      <div className="px-4">
        <Outlet />
      </div>
    </div>
  )
}

const LINKS = [
  {
    to: 'links',
    title: 'Links',
  },
  {
    to: 'appearance',
    title: 'Appearance',
  },
  {
    to: 'settings',
    title: 'Settings',
  },
]

function Navbar({ username }: { username: string }) {
  return (
    <nav className="flex items-center py-4 px-6">
      <div className="mr-4 font-bold">
        <Link to="/" prefetch="intent">
          Logo
        </Link>
      </div>
      <ul className="flex items-center gap-4">
        {LINKS.map(link => (
          <li key={link.to}>
            <NavLink
              to={link.to}
              className={({ isActive }) => (isActive ? 'underline' : '')}
            >
              {link.title}
            </NavLink>
          </li>
        ))}
      </ul>
      <div className="ml-auto flex items-center gap-4">
        <SharePopover />
        <UserMenu />
      </div>
    </nav>
  )
}

const UserMenu = () => {
  const navigate = useNavigate()
  const submit = useSubmit()
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className="h-10 w-10 rounded-full bg-gray-300"
          aria-label="User menu"
        ></button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          className="min-w-[220px] rounded-sm bg-white p-2 shadow"
          sideOffset={5}
        >
          <DropdownMenu.Item
            onSelect={() => navigate('account')}
            className="relative flex cursor-pointer items-center p-1 outline-none hover:bg-gray-100"
          >
            Account <div className="ml-auto">⌘+T</div>
          </DropdownMenu.Item>
          <DropdownMenu.Item className="relative flex cursor-pointer items-center p-1 outline-none hover:bg-gray-100">
            Preferences <div className="ml-auto">⌘+N</div>
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="m-2 h-px bg-gray-200" />
          <DropdownMenu.Item
            onSelect={() => submit(null, { method: 'post', action: '/logout' })}
            className="relative flex cursor-pointer items-center p-1 outline-none hover:bg-gray-100"
          >
            Logout <div className="ml-auto">⌘+N</div>
          </DropdownMenu.Item>

          <DropdownMenu.Arrow className="fill-white" />
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

function SharePopover() {
  const user = useUser()
  const [isCopied, copy] = useCopyToClipboard()
  // TODO: get server side HOST
  const txt = `http://localhost:3000/${user.username}`

  const handleCopy = () => {
    copy(txt)
  }
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button className="text-slate-600" aria-label="Share menu">
          Share
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="w-64 rounded-sm bg-white p-5 shadow"
          sideOffset={5}
          align="end"
        >
          <div className="flex flex-col gap-2">
            <p className="mb-2 font-bold">Share your link</p>
            <a
              target="_blank"
              href="http://localhost:3000/remixer"
              rel="noreferrer"
            >
              Visit yuour profile
            </a>
            <button
              onClick={handleCopy}
              className="flex items-center justify-between"
            >
              <span>onelink/remixer</span>
              <span className={isCopied ? 'text-green-500' : ''}>
                {isCopied ? 'Copied' : 'Copy'}
              </span>
            </button>
          </div>
          <Popover.Close className="absolute top-4 right-4" aria-label="Close">
            x
          </Popover.Close>
          <Popover.Arrow className="fill-white" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
