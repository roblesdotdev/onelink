const DEV_HOSTS = ['localhost', '127.0.0.1', '192.168.1']

export function getDomainUrl(request: Request) {
  const host =
    request.headers.get('X-Forwarded-Host') ?? request.headers.get('host')
  if (!host) {
    throw new Error('Could not determine domain URL.')
  }
  const protocol = DEV_HOSTS.some(h => host.startsWith(h)) ? 'http' : 'https'
  return `${protocol}://${host}`
}
