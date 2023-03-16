import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import type { LoaderFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { Link, NavLink, Outlet, useNavigate, useSubmit } from '@remix-run/react'
import { useUser } from '~/utils/misc'
import { requireUser } from '~/utils/session.server'

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
        <Link to={`/${username}`}>Share</Link>
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
