import type { ActionFunction, LoaderFunction } from '@remix-run/node'
import { json } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import { Form, Link } from '@remix-run/react'
import invariant from 'tiny-invariant'
import { YournameInput } from '~/components/forms'
import { getJoinInfoSession } from '~/utils/join.server'
import { getSessionUser } from '~/utils/session.server'
import { validateUsernameExistence } from '~/utils/validation'

export const tokenType = 'join'
export const joinTokenQueryParam = 'token'

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getSessionUser(request)
  const joinInfoSession = await getJoinInfoSession(request)

  if (user)
    return redirect('/admin', {
      headers: {
        'Set-Cookie': await joinInfoSession.destroy(),
      },
    })

  return json({})
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const joinInfoSession = await getJoinInfoSession(request)
  const yourname = formData.get('yourname')
  invariant(typeof yourname === 'string', 'yourname type is invalid')
  if (yourname) {
    joinInfoSession.setYourname(yourname)
    const error = await validateUsernameExistence(yourname)
    if (error) joinInfoSession.flashError({ key: 'error-yourname', error })
  }

  return redirect('/signup', {
    headers: await joinInfoSession.getHeaders(),
  })
}

export default function Index() {
  return (
    <div className="pb-10">
      <div className="px-3 py-6">
        <div className="flex items-center justify-between">
          <Link to="/" prefetch="intent">
            <h1 className="text-lg font-bold">
              one<span className="text-slate-400">.</span>link
            </h1>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login" className="font-medium hover:underline">
              Log In
            </Link>
            <Link
              to="/signup"
              className="rounded-md bg-slate-900 px-4 py-3 text-sm font-medium text-white"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
      <div className="px-3 pt-16 text-center">
        <p className="mb-2 w-full text-sm font-bold text-blue-700">
          JUST ONE LINK!
        </p>
        <h1 className="text-4xl font-bold">The Amazing Link For Everithing</h1>
        <div className="py-6">
          <Form
            method="post"
            autoComplete="off"
            noValidate
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck="false"
            className="flex flex-wrap gap-2"
          >
            <YournameInput />
            <button
              type="submit"
              className="w-full whitespace-nowrap rounded-md bg-slate-900 py-4 text-white"
            >
              Create My Link
            </button>
          </Form>
        </div>
        <p className="w-full text-slate-600">
          It's free and take less than a minute.
        </p>
      </div>

      {/* MARQUEE */}
      <div className="relative mt-32 flex gap-2 overflow-x-hidden bg-white py-4">
        <ul className="flex animate-marquee items-center gap-2 pl-2">
          {MARQUEE_ITEMS.map(item => (
            <li
              className="whitespace-nowrap rounded-full bg-slate-100 py-2 px-4 text-sm"
              key={item.id}
            >
              <span>{item.title}</span>
            </li>
          ))}
        </ul>
        <ul className="absolute top-4 flex animate-marquee2 items-center gap-2 pl-2">
          {MARQUEE_ITEMS.map(item => (
            <li
              className="whitespace-nowrap rounded-full bg-slate-100 py-2 px-4 text-sm"
              key={item.id}
            >
              <span>{item.title}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="px-4 pt-12">
        <div className="rounded-md bg-slate-100 px-3 py-12 text-center">
          <p className="mb-2 text-sm font-bold text-blue-700">MAKE IT EASY</p>
          <h1 className="text-2xl font-bold">Features designed for you</h1>
          <p className="mt-3 text-slate-600">
            Combine everything in one link, online content, digital products,
            subscriptions and more.
          </p>

          <ul className="mt-6 flex flex-col gap-3">
            <li className="flex flex-col items-center gap-3 rounded-md bg-white px-4 py-12">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 font-bold text-white">
                L
              </span>
              <h1 className="mt-4 text-xl font-bold">Create</h1>
              <p className="text-slate-600">
                Create links easily, organize all the links the way you want.
                Make it right now. It's free.
              </p>
            </li>
            <li className="flex flex-col items-center gap-3 rounded-md bg-white px-4 py-12">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 font-bold text-white">
                I
              </span>
              <h1 className="mt-4 text-xl font-bold">Share</h1>
              <p className="text-slate-600">
                Share your link anywhere. TikTok, Instagram, Twitter or your
                personal website.
              </p>
            </li>
          </ul>
        </div>
      </div>

      <div className="px-3 pt-12">
        <div className="rounded-md px-3 py-12 text-center">
          <p className="mb-2 text-sm font-bold text-blue-700">
            MANAGE LINKS WITHOUT HASSLE
          </p>
          <h1 className="text-2xl font-bold">Manage your links as you wish</h1>
          <p className="text-slate-600">
            Organize all the links according you needs, make your audience to
            find them easily. With just a few steps.
          </p>
          <div className="py-10">
            <Link
              className="rounded-md bg-slate-900 px-6 py-3 text-white"
              to="/signup"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>

      <div className="px-3 pt-12">
        <div className="rounded-md bg-slate-900 px-4 py-10 text-center text-white">
          <h1 className="mb-4 text-2xl font-bold">Get started with one.link</h1>
          <p className="text-slate-300">
            Loved by thousands of artists, writers, musicians, podcasters,
            youtubers, gamers, developers, designers...
          </p>
          <div className="pt-10">
            <Link
              className="rounded-md bg-blue-700 py-3 px-6 text-white"
              to="/signup"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>

      <footer className="px-3 pt-12">
        <div className="flex items-center justify-between">
          <Link to="/" prefetch="intent">
            <h1 className="text-lg font-bold">
              one<span className="text-slate-400">.</span>link
            </h1>
          </Link>
          <div className="flex items-center gap-4">
            <a
              href="https://linkedin.com/in/robles-ra"
              target="_blank"
              rel="noreferrer"
            >
              L
            </a>
            <a
              href="https://github.com/roblesdotdev"
              target="_blank"
              rel="noreferrer"
            >
              G
            </a>
          </div>
        </div>
        <div className="my-4 h-px w-full bg-slate-300" />
        <p className="text-sm text-slate-600">
          &copy; roblesdotdev {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  )
}

const MARQUEE_ITEMS = [
  'Musicians',
  'Writers',
  'Podcasters',
  'Programmers',
  'Designers',
  'Content Creators',
].map((item, idx) => ({
  id: idx + 1,
  title: item,
}))
