import {
  Menu,
  MenuButton,
  MenuItem,
  MenuLink,
  MenuList,
} from '@reach/menu-button'
import type { LoaderFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { Link, NavLink, Outlet, useSubmit } from '@remix-run/react'
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

function UserMenu() {
  const submit = useSubmit()

  return (
    <Menu>
      <MenuButton className="h-10 w-10 rounded-full bg-gray-400">
        <span className="sr-only">User Menu</span>
      </MenuButton>
      <MenuList>
        <MenuLink as={Link} to="account">
          Account
        </MenuLink>
        <MenuItem
          onSelect={() => submit(null, { method: 'post', action: '/logout' })}
        >
          Logout
        </MenuItem>
      </MenuList>
    </Menu>
  )
}
