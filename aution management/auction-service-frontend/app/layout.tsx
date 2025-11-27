import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Auction Management Service',
  description: 'Buy and sell land and vehicles through auctions',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="text-xl font-bold text-blue-600">
                Auction Service
              </Link>
              <div className="flex gap-6">
                <Link href="/auctions" className="text-gray-700 hover:text-blue-600">
                  Auctions
                </Link>
                <Link href="/rooms" className="text-gray-700 hover:text-blue-600">
                  Rooms
                </Link>
                <Link href="/dashboard" className="text-gray-700 hover:text-blue-600">
                  Dashboard
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <main className="min-h-screen bg-gray-50">
          {children}
        </main>
        <footer className="bg-gray-800 text-white py-8 mt-12">
          <div className="container mx-auto px-4 text-center">
            <p>© 2024 Auction Management Service. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  )
}
