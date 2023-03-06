import { useLocation, useNavigate } from '@remix-run/react'
import errorStack from 'error-stack-parser'

function ErrorStack({ error }: { error: Error }) {
  const frames = errorStack.parse(error)
  return (
    <details className="mt-8">
      <summary>{error.message}</summary>
      <div>
        {frames.map(frame => (
          <div
            key={[frame.fileName, frame.lineNumber, frame.columnNumber].join(
              '-',
            )}
            className="pt-4"
          >
            <h6 className="pt-2">{frame.functionName}</h6>
            <div className="font-mono opacity-75">
              {frame.fileName}:{frame.lineNumber}:{frame.columnNumber}
            </div>
          </div>
        ))}
      </div>
    </details>
  )
}

interface ErrorPageProps {
  title: string
  subtitle: string
}

function ErrorPage({
  error,
  errorProps,
  actionLabel,
  action,
}: {
  error?: Error
  errorProps: ErrorPageProps
  actionLabel?: string
  action?: () => void
}) {
  return (
    <>
      <noscript>
        <div
          style={{
            backgroundColor: 'black',
            color: 'white',
            padding: 30,
          }}
        >
          <h1 style={{ fontSize: '2em' }}>{errorProps.title}</h1>
          <p style={{ fontSize: '1.5em' }}>{errorProps.subtitle}</p>
          <small>
            Also, this site works much better with JavaScript enabled...
          </small>
        </div>
      </noscript>

      <div className="relative mx-auto h-full max-w-xl py-12 px-6 md:max-w-2xl lg:max-w-4xl ">
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold md:text-5xl">{errorProps.title}</h1>
          <h2 className="font-light md:text-lg">{errorProps.subtitle}</h2>
          {action ? (
            <button
              onClick={action}
              className="mt-6 self-start rounded-md border-2 bg-slate-900 px-12 py-4 text-sm font-medium text-white"
            >
              {actionLabel ? actionLabel : 'Back to Home'}
            </button>
          ) : null}
        </div>
        {error && process.env.NODE_ENV === 'development' ? (
          <ErrorStack error={error} />
        ) : null}
      </div>
    </>
  )
}

function NotFound() {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  return (
    <ErrorPage
      errorProps={{
        title: "404 - Oh no, you found a page that's missing stuff.",
        subtitle: `"${pathname}" is not a page on this site. So sorry.`,
      }}
      actionLabel="Back to home"
      action={() => navigate('/', { replace: true })}
    />
  )
}

function ServerError({ error }: { error?: Error }) {
  const { pathname } = useLocation()

  return (
    <ErrorPage
      error={error}
      errorProps={{
        title: '500 - Oh no, something did not go well.',
        subtitle: `"${pathname}" is currently not working. So sorry.`,
      }}
    />
  )
}

export { ServerError, NotFound }
