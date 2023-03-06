import { createCookieSessionStorage } from '@remix-run/node'
import { getRequiredServerEnvVar } from './misc'

export const joinSessionIdKey = '__join_session'

export const joinInfoStorage = createCookieSessionStorage({
  cookie: {
    name: joinSessionIdKey,
    secrets: [getRequiredServerEnvVar('SESSION_SECRET')],
    sameSite: 'lax',
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  },
})

async function getJoinInfoSession(request: Request) {
  const session = await joinInfoStorage.getSession(
    request.headers.get('Cookie'),
  )
  const initialValue = await joinInfoStorage.commitSession(session)

  const commit = async () => {
    const currentValue = await joinInfoStorage.commitSession(session)
    return currentValue === initialValue ? null : currentValue
  }
  return {
    session,
    getEmail: () => session.get('email') as string | undefined,
    setEmail: (email: string) => session.set('email', email),
    getYourname: () => session.get('yourname') as string | undefined,
    setYourname: (yourname: string) => session.set('yourname', yourname),
    getError: (key: 'error-email' | 'error-yourname' | 'error-form') =>
      session.get(key) as string | undefined,
    flashError: ({
      key,
      error,
    }: {
      key: 'error-email' | 'error-yourname' | 'error-form'
      error: string
    }) => session.flash(key, error),
    clean: () => {
      session.unset('email')
      session.unset('yourname')
      session.unset('error-email')
      session.unset('error-yourname')
      session.unset('error-form')
    },
    cleanErrors: () => {
      session.unset('error-email')
      session.unset('error-yourname')
      session.unset('error-form')
    },
    destroy: () => joinInfoStorage.destroySession(session),
    commit,
    /**
     * This will initialize a Headers object if one is not provided.
     * It will set the 'Set-Cookie' header value on that headers object.
     * It will then return that Headers object.
     */
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

export { getJoinInfoSession }
