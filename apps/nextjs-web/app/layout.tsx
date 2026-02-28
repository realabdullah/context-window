import type { Metadata } from 'next'
import { Syne, Source_Sans_3, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/lib/auth-context'
import { CommandPalette } from '@/components/command-palette'
import { CreateTraceDialogProvider } from '@/components/create-trace-dialog'
import { QueryProvider } from '@/components/query-provider'
import './globals.css'

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-display-var',
  display: 'swap',
})
const sourceSans = Source_Sans_3({
  subsets: ['latin'],
  variable: '--font-sans-var',
  display: 'swap',
})
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono-var',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Context Window | AI-Powered Ghostwriter for Technical Thoughts',
  description: 'The asynchronous ghostwriter for your technical thoughts. Log breadcrumbs as you build, hit Compile, and get a structured technical draft from your preferred AI.',
  icons: {
    icon: [
      {
        url: '/favicon.svg',
        type: 'image/svg+xml',
      },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${syne.variable} ${sourceSans.variable} ${jetbrainsMono.variable}`}
    >
      <body className="font-sans antialiased bg-background text-foreground">
        <QueryProvider>
          <AuthProvider>
            <CreateTraceDialogProvider>
              <CommandPalette />
              {children}
            </CreateTraceDialogProvider>
          </AuthProvider>
        </QueryProvider>
        <Analytics />
      </body>
    </html>
  )
}
