import type { Metadata } from 'next'
import './globals.css'
import { ReduxProvider } from '@/components/providers/ReduxProvider'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'NextPick - Movie Tracker',
  description: 'Track and discover movies with your personal watchlist',
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
          <AuthProvider>
            <Header />
            <main className="flex-1 pt-20 lg:pt-24">
              {children}
            </main>
            <Footer />
          </AuthProvider>
        </ReduxProvider>
      </body>
    </html>
  )
}