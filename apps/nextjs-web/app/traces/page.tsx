import { redirect } from 'next/navigation'

/**
 * API redirects here after GitHub OAuth (FRONTEND_URL/traces).
 * Send users to the app dashboard.
 */
export default function TracesRedirect() {
  redirect('/app')
}
