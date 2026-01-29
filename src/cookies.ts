// Cookie utilities for development vs production

export function getCookieOptions(c: any) {
  // Detect if we're in development (localhost or sandbox)
  const host = c.req.header('host') || ''
  const isDevelopment = host.includes('localhost') || host.includes('127.0.0.1') || host.includes('.sandbox.')
  
  return {
    httpOnly: true,
    secure: !isDevelopment, // Only secure in production
    sameSite: 'Lax' as const,
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/'
  }
}
