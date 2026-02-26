import type { Metadata } from 'next'
import './globals.css'
import { ReduxProvider } from '@/components/providers/ReduxProvider'
import { ConditionalLayout } from '@/components/layout/ConditionalLayout'

export const metadata: Metadata = {
  title: 'NextPick - Movie Tracker',
  description: 'Discover and explore movies, anime, K-drama, and games',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-b from-gray-900 via-netflix-dark to-black text-white min-h-screen flex flex-col">
        <ReduxProvider>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </ReduxProvider>
      </body>
    </html>
  )
}