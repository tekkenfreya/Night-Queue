import type { Metadata } from 'next'
import './globals.css'
import { ReduxProvider } from '@/components/providers/ReduxProvider'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'NightQueue - Movie Tracker',
  description: 'Track and discover movies with your personal watchlist',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-netflix-dark text-white min-h-screen flex flex-col">
        <ReduxProvider>
          <AuthProvider>
            <Header />
            <main className="flex-1 pt-16 lg:pt-20">
              {children}
            </main>
            <Footer />
          </AuthProvider>
        </ReduxProvider>
      </body>
    </html>
  )
}