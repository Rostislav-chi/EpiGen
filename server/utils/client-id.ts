export function getClientId(event: any): string {
  const cookies = parseCookies(event)
  let clientId = cookies.clientId

  if (!clientId) {
    clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    setCookie(event, 'clientId', clientId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365,
    })
  }

  return clientId
}
