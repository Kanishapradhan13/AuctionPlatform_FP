import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Real-Time Bidding - Bhutan Online Auction',
  description: 'Real-time bidding interface for Bhutan Online Auction Platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="bg-primary-600 text-white shadow-lg">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Bhutan Auction - Bidding</h1>
              <div className="flex gap-4">
                <a href="/" className="hover:text-primary-200">Home</a>
                <a href="/auction/test-auction" className="hover:text-primary-200">Live Auction</a>
                <a href="/history" className="hover:text-primary-200">History</a>
              </div>
            </div>
          </div>
        </nav>
        <main className="min-h-screen bg-gray-50">
          {children}
        </main>
        <footer className="bg-gray-800 text-white py-6 mt-12">
          <div className="container mx-auto px-4 text-center">
            <p>&copy; 2024 Bhutan Online Auction Platform - Real-Time Bidding Service</p>
          </div>
        </footer>
      </body>
    </html>
  )
}
