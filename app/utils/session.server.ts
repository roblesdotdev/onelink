import { createCookieSessionStorage, redirect } from '@remix-run/node'
import { getRequiredServerEnvVar, safeRedirect } from './misc'
import type { User } from '~/types'

const SESSION_SECRET = getRequiredServerEnvVar('SESSION_SECRET')
const sessionIdKey = '__session_id__'
const joinEmailSessionKey = '__join_token__'

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: '_session',
    sameSite: 'lax',
    path: '/',
    httpOnly: true,
    secrets: [SESSION_SECRET],
    secure: process.env.NODE_ENV === 'production',
  },
})

export async function getSession(request: Request) {
  const session = await sessionStorage.getSession(request.headers.get('Cookie'))
  const initialValue = await sessionStorage.commitSession(session)
  const getSessionId = () => session.get(sessionIdKey) as string | undefined
  const unsetSessionId = () => session.unset(sessionIdKey)

  const commit = async () => {
    const currentValue = await sessionStorage.commitSession(session)
    return currentValue === initialValue ? null : currentValue
  }

  return {
    session,
    commit,
    signOut: async () => {
      const sessionId = getSessionId()
      if (sessionId) {
        unsetSessionId()
      }
    },
    getHeaders: async (headers: ResponseInit['headers'] = new Headers()) => {
      const value = await commit()
      if (!value) return headers
      if (headers instanceof Headers) {
        headers.append('Set-Cookie', value)
      } else if (Array.isArray(headers)) {
        headers.push(['Set-Cookie', value])
      } else {
        headers['Set-Cookie'] = value
      }
      return headers
    },
  }
}

export async function createUserSession({
  request,
  userId,
  remember,
  redirectTo,
}: {
  request: Request
  userId: User['id']
  remember: boolean
  redirectTo: string
}) {
  const { session } = await getSession(request)
  session.set(sessionIdKey, userId)
  return redirect(safeRedirect(redirectTo), {
    headers: {
      'Set-Cookie': await sessionStorage.commitSession(session, {
        maxAge: remember ? 60 * 60 * 24 * 7 : undefined,
      }),
    },
  })
}

export async function getSessionUser(request: Request) {
  const { session } = await getSession(request)

  return session.get(sessionIdKey) as string | undefined
}

export async function logout(request: Request) {
  const { session } = await getSession(request)
  return redirect('/', {
    headers: {
      'Set-Cookie': await sessionStorage.destroySession(session),
    },
  })
}

export async function requireSessionUser(
  request: Request,
): Promise<User['id']> {
  const user = await getSessionUser(request)
  if (!user) {
    const { getHeaders, signOut } = await getSession(request)
    await signOut()
    throw redirect('/login', { headers: await getHeaders() })
  }
  return user
}

export async function createJoinSession({
  request,
  email,
}: {
  request: Request
  email: string
}) {
  const { session } = await getSession(request)
  session.set(joinEmailSessionKey, email)
  return redirect('/join', {
    headers: {
      'Set-Cookie': await sessionStorage.commitSession(session),
    },
  })
}

export async function getJoinSession(request: Request) {
  const { session } = await getSession(request)
  return session.get(joinEmailSessionKey)
}
