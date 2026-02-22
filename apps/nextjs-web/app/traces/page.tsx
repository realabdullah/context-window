import { redirect } from 'next/navigation'

/**
 * API redirects here after GitHub OAuth (origin/traces; origin = Next.js or Vite app).
 * Send users to the app dashboard.
 */
export default function TracesRedirect() {
  redirect('/app')
}
